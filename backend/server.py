from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from twilio.rest import Client
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# --- Configuração do Twilio ---
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER') # whatsapp:+1...
TWILIO_TO_NUMBER = os.getenv('TWILIO_TO_NUMBER')     # whatsapp:+1... (Seu número)

# Inicializa o cliente Twilio
try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print("Twilio Client Initialized Successfully")
except Exception as e:
    print(f"Error initializing Twilio Client: {e}")
    twilio_client = None  # Garante que não haverá erro se as credenciais estiverem faltando

# -------------------- FastAPI app --------------------
# Create the main app without a prefix
app = FastAPI()

# -------------------- Rota de monitoramento --------------------
# Apenas para o UptimeRobot manter o backend acordado
@app.get("/ping")
@app.head("/ping") 
def ping():
    # O método HEAD não espera um corpo de resposta,
    # mas o FastAPI lida com isso automaticamente.
    # O status 200 (OK) será enviado.
    return {"status": "ok"}

# -------------------- Criação do router --------------------
api_router = APIRouter(prefix="/api")

# -------------------- Incluir router no app --------------------
app.include_router(api_router)

# ==================== MODELS ====================

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    duration_minutes: int
    description: Optional[str] = None

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone: str
    email: Optional[str] = None
    total_appointments: int = 0
    last_visit: Optional[str] = None

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    service_name: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    duration_minutes: int
    status: str = "scheduled"  # scheduled, completed, no-show, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    language: str = "en"  # en or pt

class BlockedSlot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    reason: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None

class MultiBlockedSlotCreate(BaseModel):
    dates: List[str]  # Lista de datas YYYY-MM-DD
    start_time: str
    end_time: str
    reason: Optional[str] = None


# ==================== INPUT MODELS ====================

class AppointmentCreate(BaseModel):
    service_id: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    date: str
    time: str
    language: str = "en"

class AppointmentUpdate(BaseModel):
    status: str

class BlockedSlotRangeCreate(BaseModel):
    start_date: str = Field(..., description="Data de início do bloqueio (formato YYYY-MM-DD)")
    end_date: str = Field(..., description="Data de fim do bloqueio (formato YYYY-MM-DD)")
    start_time: str = Field(..., pattern=r'^\d{2}:\d{2}$', description="Hora de início do bloqueio (formato HH:MM)")
    end_time: str = Field(..., pattern=r'^\d{2}:\d{2}$', description="Hora de fim do bloqueio (formato HH:MM)")
    reason: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================

def send_notification_mock(notification_type: str, recipient: str, data: dict, language: str = "en"):
    """Mock notification function - logs instead of sending"""
    logger.info(f"[MOCK NOTIFICATION] Type: {notification_type}")
    logger.info(f"[MOCK NOTIFICATION] Recipient: {recipient}")
    logger.info(f"[MOCK NOTIFICATION] Language: {language}")
    logger.info(f"[MOCK NOTIFICATION] Data: {data}")
    
    if notification_type == "sms":
        logger.info(f"[MOCK SMS] Would send SMS to {recipient}")
        logger.info(f"[MOCK SMS] Message: Appointment confirmed for {data.get('date')} at {data.get('time')}")
    elif notification_type == "email":
        logger.info(f"[MOCK EMAIL] Would send email to {recipient}")
        logger.info(f"[MOCK EMAIL] Subject: Appointment Confirmation - Jhun Black Barber")
    elif notification_type == "whatsapp":
        logger.info(f"[MOCK WHATSAPP] Would send WhatsApp to {recipient}")
    
    return True

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Jhun Black Barber API"}

# ========== SERVICES ==========

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

# ========== APPOINTMENTS ==========

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    # Get service details
    service = await db.services.find_one({"id": appointment_data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check if slot is available
    date = appointment_data.date
    time = appointment_data.time
    duration = service['duration_minutes']
    
    # Check for existing appointments
    existing = await db.appointments.find_one({
        "date": date,
        "time": time,
        "status": {"$in": ["scheduled", "completed"]}
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already booked")
    
    # Check for blocked slots
    blocked = await db.blocked_slots.find_one({
        "date": date,
        "start_time": {"$lte": time},
        "end_time": {"$gt": time}
    }, {"_id": 0})
    
    if blocked:
        raise HTTPException(status_code=400, detail="Time slot is blocked")
    
    # Create appointment
    appointment = Appointment(
        service_id=appointment_data.service_id,
        service_name=service['name'],
        customer_name=appointment_data.customer_name,
        customer_phone=appointment_data.customer_phone,
        customer_email=appointment_data.customer_email,
        date=date,
        time=time,
        duration_minutes=duration,
        language=appointment_data.language
    )
    
    doc = appointment.model_dump()
    await db.appointments.insert_one(doc)
    
    # Update or create customer
    customer = await db.customers.find_one({"phone": appointment_data.customer_phone}, {"_id": 0})
    if customer:
        await db.customers.update_one(
            {"phone": appointment_data.customer_phone},
            {
                "$set": {"last_visit": date, "full_name": appointment_data.customer_name},
                "$inc": {"total_appointments": 1}
            }
        )
    else:
        new_customer = Customer(
            full_name=appointment_data.customer_name,
            phone=appointment_data.customer_phone,
            email=appointment_data.customer_email,
            total_appointments=1,
            last_visit=date
        )
        await db.customers.insert_one(new_customer.model_dump())
    
    # Dados para Notificações
    notification_data = {
        "service": service['name'],
        "date": date,
        "time": time,
        "customer_name": appointment_data.customer_name
    }
    
    # Notificações ao Cliente (Mocks - Manter por enquanto)
    send_notification_mock("sms", appointment_data.customer_phone, notification_data, appointment_data.language)
    if appointment_data.customer_email:
        send_notification_mock("email", appointment_data.customer_email, notification_data, appointment_data.language)
    
    # Notificação ao Admin (Twilio WhatsApp REAL)
    # Verifica se o cliente Twilio foi inicializado corretamente e se os números de destino/origem estão configurados
    if twilio_client and TWILIO_TO_NUMBER and TWILIO_FROM_NUMBER:
        try:
            # Mensagem para o seu marido/admin
            message_body = f"""
                🚨 NOVO AGENDAMENTO! 🚨

                    Serviço: {service['name']}
                    Cliente: {appointment_data.customer_name}
                    Data: {date} às {time}
                    Telefone: {appointment_data.customer_phone}
                    """

            message = twilio_client.messages.create(
                from_=TWILIO_FROM_NUMBER,
                to=TWILIO_TO_NUMBER,
                body=message_body
            )
            # O print é útil para debug no log do Render
            print(f"WhatsApp notification sent. SID: {message.sid}")
        except Exception as e:
            # Não queremos falhar o agendamento se o WhatsApp falhar
            print(f"Error sending Twilio WhatsApp notification: {e}")
    
    return appointment

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(date: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if date:
        query["date"] = date
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", 1).to_list(1000)
    return appointments

@api_router.patch("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: str, update_data: AppointmentUpdate):
    result = await db.appointments.find_one_and_update(
        {"id": appointment_id},
        {"$set": {"status": update_data.status}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    result.pop('_id', None)
    return Appointment(**result)

# ========== AVAILABLE SLOTS ==========

@api_router.get("/available-slots")
async def get_available_slots(date: str, service_id: str):
    # Get service duration
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    duration = service['duration_minutes']
    
    # Business hours: 9:00 AM - 9:00 PM (Monday to Saturday)
    start_hour = 9
    end_hour = 21  # 21 (9 PM) permite o último slot começar às 20:30 e terminar às 21:00 (para um serviço de 30m)
    slot_interval = 30  # 30-minute intervals
    
    # Generate all possible slots (em formato 24h para facilitar o cálculo)
    slots_24h = []
    current_minutes = start_hour * 60
    end_minutes = end_hour * 60
    
    while current_minutes < end_minutes:
        hour = current_minutes // 60
        minute = current_minutes % 60
        time_slot_24h = f"{hour:02d}:{minute:02d}"
        
        # Check if this slot + duration fits within business hours
        end_time_minutes = current_minutes + duration
        if end_time_minutes <= end_minutes:
            slots_24h.append(time_slot_24h)
        
        current_minutes += slot_interval
    
    # Get existing appointments for this date
    appointments = await db.appointments.find({
        "date": date,
        "status": {"$in": ["scheduled", "completed"]}
    }, {"_id": 0}).to_list(1000)
    
    # Get blocked slots for this date
    blocked_slots = await db.blocked_slots.find({"date": date}, {"_id": 0}).to_list(1000)
    
    # Filter out unavailable slots
    available_slots_24h = []
    for slot_24h in slots_24h:
        is_available = True
        slot_hour, slot_minute = map(int, slot_24h.split(':'))
        slot_minutes = slot_hour * 60 + slot_minute
        slot_end_minutes = slot_minutes + duration
        
        # Check against appointments
        for apt in appointments:
            apt_hour, apt_minute = map(int, apt['time'].split(':'))
            apt_minutes = apt_hour * 60 + apt_minute
            apt_end_minutes = apt_minutes + apt['duration_minutes']
            
            # Check for overlap
            if not (slot_end_minutes <= apt_minutes or slot_minutes >= apt_end_minutes):
                is_available = False
                break
        
        # Check against blocked slots
        if is_available:
            for blocked in blocked_slots:
                blocked_start_hour, blocked_start_minute = map(int, blocked['start_time'].split(':'))
                blocked_end_hour, blocked_end_minute = map(int, blocked['end_time'].split(':'))
                blocked_start_minutes = blocked_start_hour * 60 + blocked_start_minute
                blocked_end_minutes = blocked_end_hour * 60 + blocked_end_minute
                
                # Check for overlap
                if not (slot_end_minutes <= blocked_start_minutes or slot_minutes >= blocked_end_minutes):
                    is_available = False
                    break
        
        if is_available:
            available_slots_24h.append(slot_24h)
    
    # NOVO PASSO: Formatar os slots disponíveis para AM/PM
    available_slots_12h = []
    for slot_24h in available_slots_24h:
        # Cria um objeto hora a partir da string 24h. Usamos uma data base arbitrária.
        time_obj = datetime.strptime(slot_24h, "%H:%M")
        # Formata para o padrão 12 horas (Ex: 09:00 AM, 08:30 PM)
        available_slots_12h.append(time_obj.strftime("%I:%M %p"))
    
    return {"available_slots": available_slots_12h}

# ========== BLOCKED SLOTS ==========

@api_router.post("/blocked-slots", status_code=201)
async def create_blocked_slot_range(data: BlockedSlotRangeCreate):
    
    # 1. Converter datas de string para objetos datetime.date
    try:
        start_date = datetime.strptime(data.start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(data.end_date, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD.")
        
    # 2. Garantir que a data de início não seja posterior à data de fim
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Data de início não pode ser posterior à data de fim.")

    # 3. Iterar por cada dia no intervalo
    # Calcula o número total de dias, incluindo a data final (+1)
    num_days = (end_date - start_date).days + 1
    
    blocked_slots_to_insert = []

    for i in range(num_days):
        current_date = start_date + timedelta(days=i)
        
        # Cria um objeto para ser inserido no MongoDB para o dia atual
        slot_data = {
            # Usando o modelo BlockedSlot como base para garantir consistência
            "id": str(uuid.uuid4()),
            "date": current_date.strftime('%Y-%m-%d'), # Formato string para salvar no DB
            "start_time": data.start_time,
            "end_time": data.end_time,
            "reason": data.reason,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        blocked_slots_to_insert.append(slot_data)

    # 4. Inserir todos os slots bloqueados de uma vez
    if blocked_slots_to_insert:
        try:
            await db.blocked_slots.insert_many(blocked_slots_to_insert)
        except Exception as e:
            logger.error(f"Database error during bulk insert: {e}")
            raise HTTPException(status_code=500, detail="Erro ao salvar bloqueios no banco de dados.")

    return {"message": f"Bloqueio criado com sucesso para {num_days} dias."}


@api_router.get("/blocked-slots", response_model=List[BlockedSlot])
async def get_blocked_slots(date: Optional[str] = None):
    query = {}
    if date:
        query["date"] = date
    
    blocked_slots = await db.blocked_slots.find(query, {"_id": 0}).to_list(1000)
    return blocked_slots

@api_router.delete("/blocked-slots/{slot_id}")
async def delete_blocked_slot(slot_id: str):
    result = await db.blocked_slots.delete_one({"id": slot_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    return {"success": True}


# ========== CUSTOMERS ==========

@api_router.get("/customers/{phone}", response_model=Customer)
async def get_customer_by_phone(phone: str):
    customer = await db.customers.find_one({"phone": phone}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.get("/customers", response_model=List[Customer])
async def get_all_customers():
    customers = await db.customers.find({}, {"_id": 0}).sort("last_visit", -1).to_list(1000)
    return customers

# ========== AUTH ==========

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    # Simple password check - in production use proper auth
    admin_password = os.environ.get('ADMIN_PASSWORD', 'jhun2025')
    
    if login_data.password == admin_password:
        # Generate simple token (in production use JWT)
        token = hashlib.sha256(f"{admin_password}-{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest()
        return LoginResponse(success=True, token=token)
    else:
        return LoginResponse(success=False)

# ========== DASHBOARD STATS ==========

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    # Today's appointments
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_appointments = await db.appointments.count_documents({"date": today, "status": "scheduled"})
    
    # Total customers
    total_customers = await db.customers.count_documents({})
    
    # This month's revenue (mock calculation)
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    month_appointments = await db.appointments.find({
        "date": {"$regex": f"^{current_month}"},
        "status": "completed"
    }, {"_id": 0}).to_list(1000)
    
    total_revenue = 0
    for apt in month_appointments:
        service = await db.services.find_one({"id": apt['service_id']}, {"_id": 0})
        if service:
            total_revenue += service['price']
    
    return {
        "today_appointments": today_appointments,
        "total_customers": total_customers,
        "monthly_revenue": total_revenue,
        "total_appointments": len(month_appointments)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize services on startup
@app.on_event("startup")
async def initialize_services():
    # Check if services exist
    count = await db.services.count_documents({})
    if count == 0:
        services = [
            {"id": str(uuid.uuid4()), "name": "Beard", "price": 15, "duration_minutes": 20, "description": "Professional beard trim and shaping"},
            {"id": str(uuid.uuid4()), "name": "Haircut & Beard", "price": 40, "duration_minutes": 45, "description": "Complete haircut with beard service"},
            {"id": str(uuid.uuid4()), "name": "Kid's Haircut", "price": 30, "duration_minutes": 40, "description": "Haircut for children"},
            {"id": str(uuid.uuid4()), "name": "Men's Haircut", "price": 30, "duration_minutes": 30, "description": "Classic men's haircut"},
            {"id": str(uuid.uuid4()), "name": "Skin Fade", "price": 35, "duration_minutes": 30, "description": "Precision skin fade haircut"},
            {"id": str(uuid.uuid4()), "name": "Head Shave", "price": 30, "duration_minutes": 30, "description": "Complete head shave"},
            {"id": str(uuid.uuid4()), "name": "Beard Shaping/Trim/Shave/Maintenance", "price": 20, "duration_minutes": 25, "description": "Comprehensive beard care"},
            {"id": str(uuid.uuid4()), "name": "Eyebrow Shaping", "price": 10, "duration_minutes": 10, "description": "Professional eyebrow grooming"},
            {"id": str(uuid.uuid4()), "name": "Straight Razor Shave", "price": 20, "duration_minutes": 30, "description": "Traditional straight razor shave"},
            {"id": str(uuid.uuid4()), "name": "Combo (Head Shave + Beard Trim)", "price": 40, "duration_minutes": 45, "description": "Head shave and beard trim combo"},
            {"id": str(uuid.uuid4()), "name": "Highlights", "price": 70, "duration_minutes": 90, "description": "Professional hair highlights"},
            {"id": str(uuid.uuid4()), "name": "Keratin Treatment", "price": 70, "duration_minutes": 60, "description": "Keratin smoothing treatment"},
            {"id": str(uuid.uuid4()), "name": "Brazilian Straightening", "price": 55, "duration_minutes": 60, "description": "Brazilian hair straightening"}
        ]
        await db.services.insert_many(services)
        logger.info("Services initialized")
