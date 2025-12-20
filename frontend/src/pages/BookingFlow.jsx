import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { enUS, ptBR, es } from 'date-fns/locale';
import { ArrowLeft, Check, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BookingFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(location.state?.language || 'en');
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      step1Title: 'SELECT SERVICE',
      step2Title: 'CHOOSE DATE & TIME',
      step3Title: 'YOUR INFORMATION',
      step4Title: 'CONFIRMATION',
      next: 'NEXT',
      back: 'BACK',
      confirm: 'CONFIRM BOOKING',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email (Optional - To receive appointment details)',
      selectDate: 'Select a date',
      selectTime: 'Select a time',
      noSlots: 'No available slots for this date',
      bookingSuccess: 'Booking confirmed! See you soon!',
      bookingError: 'Booking failed. Please try again.',
      confirmationMsg: 'Your appointment is confirmed!',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      total: 'Total',
    },
    pt: {
      step1Title: 'SELECIONE O SERVIÇO',
      step2Title: 'ESCOLHA DATA E HORÁRIO',
      step3Title: 'SUAS INFORMAÇÕES',
      step4Title: 'CONFIRMAÇÃO',
      next: 'PRÓXIMO',
      back: 'VOLTAR',
      confirm: 'CONFIRMAR AGENDAMENTO',
      fullName: 'Nome Completo',
      phone: 'Telefone',
      email: 'Email (Opcional - Para detalhes do agendamento)',
      selectDate: 'Selecione uma data',
      selectTime: 'Selecione um horário',
      noSlots: 'Sem horários disponíveis para esta data',
      bookingSuccess: 'Agendamento confirmado! Até breve!',
      bookingError: 'Falha no agendamento. Tente novamente.',
      confirmationMsg: 'Seu agendamento está confirmado!',
      service: 'Serviço',
      date: 'Data',
      time: 'Horário',
      total: 'Total',
    },
    es: {
      step1Title: 'SELECCIONE EL SERVICIO',
      step2Title: 'ELIJA FECHA Y HORA',
      step3Title: 'SU INFORMACIÓN',
      step4Title: 'CONFIRMACIÓN',
      next: 'SIGUIENTE',
      back: 'VOLVER',
      confirm: 'CONFIRMAR CITA',
      fullName: 'Nombre Completo',
      phone: 'Teléfono',
      email: 'Correo (Opcional - Para detalles de la cita)',
      selectDate: 'Seleccione una fecha',
      selectTime: 'Seleccione un horario',
      noSlots: 'No hay horarios disponibles para esta fecha',
      bookingSuccess: '¡Cita confirmada! ¡Nos vemos pronto!',
      bookingError: 'Error en la reserva. Intente de nuevo.',
      confirmationMsg: '¡Su cita está confirmada!',
      service: 'Servicio',
      date: 'Fecha',
      time: 'Hora',
      total: 'Total',
    }
  };

  const t = content[language];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchAvailableSlots = async () => {
  if (!selectedDate || !selectedService) return;
  
  setLoading(true);
  try {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const response = await axios.get(`${API}/available-slots`, {
      params: {
        date: dateStr,
        service_id: selectedService.id
      }
    });

    let slots = response.data.available_slots;

    // LÓGICA PARA BLOQUEAR HORÁRIOS QUE JÁ PASSARAM (PADRÃO AM/PM)
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    if (dateStr === todayStr) {
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      slots = slots.filter(slot => {
        // Assume que o slot vem como "02:30 PM"
        const [time, modifier] = slot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        // Converte para 24h para comparar com o relógio do sistema
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return hours > currentHour || (hours === currentHour && minutes > currentMinutes);
      });
    }

    setAvailableSlots(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    toast.error('Failed to load available times');
  } finally {
    setLoading(false);
  }
};

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Limpa o horário selecionado ao mudar a data
    setAvailableSlots([]); // Limpa a lista antiga para evitar confusão visual enquanto carrega
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (step === 2 && selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        service_id: selectedService.id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        language: language
      };

      await axios.post(`${API}/appointments`, appointmentData);
      toast.success(t.bookingSuccess);
      setStep(4);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.detail || t.bookingError);
    } finally {
      setLoading(false);
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="chair-background min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            data-testid="back-btn"
            variant="ghost"
            onClick={handleBack}
            className="text-[#FFD700] hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t.back}
          </Button>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= num ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white/50'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 4 && <div className={`w-12 h-1 ${
                  step > num ? 'bg-[#FFD700]' : 'bg-white/10'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-[#FFD700] text-4xl font-bold text-center mb-8">{t.step1Title}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  data-testid={`service-card-${service.id}`}
                  onClick={() => handleServiceSelect(service)}
                  className="service-card p-6 bg-black/60 border-white/20 hover:border-[#FFD700] cursor-pointer"
                >
                  <h3 className="text-white text-xl font-bold mb-2">{service.name}</h3>
                  <div className="flex items-center justify-between text-white/70">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-[#FFD700]" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-[#FFD700]" />
                      <span className="text-xl font-bold text-[#FFD700]">{service.price}</span>
                    </div>
                  </div>
                  {service.description && (
                    <p className="text-white/50 text-sm mt-2">{service.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-[#FFD700] text-4xl font-bold text-center mb-8">{t.step2Title}</h2>
            <Card className="p-6 bg-black/60 border-white/20">
              <div className="mb-6">
                <h3 className="text-white text-lg mb-2">{t.selectDate}</h3>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={isPastDate}
                    // Esta linha abaixo muda o idioma do calendário dinamicamente:
                    locale={language === 'pt' ? ptBR : language === 'es' ? es : enUS}
                    className="rounded-md border border-white/20 bg-black/40 text-white"
                    data-testid="booking-calendar"
                  />
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-white text-lg mb-4">{t.selectTime}</h3>
                  {loading ? (
                    <div className="text-white text-center py-8">Loading...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          data-testid={`time-slot-${slot}`}
                          onClick={() => handleTimeSelect(slot)}
                          className={`time-slot ${
                            selectedTime === slot
                              ? 'bg-[#FFD700] text-black hover:bg-[#FFC107]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-center py-8">{t.noSlots}</p>
                  )}
                </div>
              )}

              {selectedTime && (
                <Button
                  data-testid="next-to-info-btn"
                  onClick={handleNext}
                  className="w-full mt-6 bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold py-6 text-lg"
                >
                  {t.next}
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: Customer Info */}
        {step === 3 && (
          <div>
            <h2 className="text-[#FFD700] text-4xl font-bold text-center mb-8">{t.step3Title}</h2>
            <Card className="p-6 bg-black/60 border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">{t.fullName} *</Label>
                  <Input
                    id="name"
                    data-testid="customer-name-input"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">{t.phone} *</Label>
                  <Input
                    id="phone"
                    data-testid="customer-phone-input"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">{t.email}</Label>
                  <Input
                    id="email"
                    data-testid="customer-email-input"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="bg-white/10 border-white/20 text-white mt-2"
                  />
                </div>
                <Button
                  data-testid="confirm-booking-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold py-6 text-lg"
                >
                  {loading ? 'Processing...' : t.confirm}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div>
            <h2 className="text-[#FFD700] text-4xl font-bold text-center mb-8">{t.step4Title}</h2>
            <Card className="p-8 bg-black/60 border-[#FFD700] text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFD700] flex items-center justify-center">
                <Check className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-6">{t.confirmationMsg}</h3>
              
              <div className="space-y-3 text-left max-w-md mx-auto mb-8">
                <div className="flex justify-between text-white">
                  <span className="text-white/70">{t.service}:</span>
                  <span className="font-bold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-white/70">{t.date}:</span>
                  <span className="font-bold">{selectedDate && format(selectedDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-white/70">{t.time}:</span>
                  <span className="font-bold">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-white border-t border-white/20 pt-3 mt-3">
                  <span className="text-white/70">{t.total}:</span>
                  <span className="text-[#FFD700] text-xl font-bold">${selectedService?.price}</span>
                </div>
              </div>

              <Button
                data-testid="back-home-btn"
                onClick={() => navigate('/')}
                className="bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold px-8 py-6 text-lg"
              >
                Back to Home
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
