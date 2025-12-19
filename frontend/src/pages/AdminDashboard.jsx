import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  LogOut,
  Plus,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({ full_name: '', phone: '', email: '' });
  const [stats, setStats] = useState({
    today_appointments: 0,
    total_customers: 0,
    monthly_revenue: 0,
    total_appointments: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Block slot form
  const [blockSlotData, setBlockSlotData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'), // Data de início
    end_date: format(new Date(), 'yyyy-MM-dd'),   // Data de fim
    start_time: '09:00',
    end_time: '12:00',
    reason: ''
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);
  
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Agora checa se selectedDates existe E tem pelo menos uma data
    if (selectedDates && selectedDates.length > 0) { 
      fetchAppointmentsByDate(selectedDates[0]); // Pega apenas a primeira data para a busca de compromissos
    }
  }, [selectedDates]); // Usa o novo nome do estado

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appointmentsRes, customersRes, blockedRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/appointments`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/blocked-slots`)
      ]);

      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
      setCustomers(customersRes.data);
      setBlockedSlots(blockedRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

 // A função agora aceita a data que deve ser buscada como argumento
  const fetchAppointmentsByDate = async (dateToFetch) => { 
    try {
      // Usa o argumento passado (que será a primeira data selecionada)
      const dateStr = format(dateToFetch, 'yyyy-MM-dd'); 
      const response = await axios.get(`${API}/appointments`, {
        params: { date: dateStr }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`${API}/appointments/${appointmentId}`, {
        status: newStatus
      });
      toast.success('Appointment status updated');
      fetchAppointmentsByDate();
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/blocked-slots`, blockSlotData);
      toast.success('Time slot blocked successfully');
      setBlockSlotData({
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '12:00',
        reason: ''
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error blocking slot:', error);
      toast.error('Failed to block time slot');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockSlot = async (slotId) => {
    try {
      await axios.delete(`${API}/blocked-slots/${slotId}`);
      toast.success('Time slot unblocked');
      fetchDashboardData();
    } catch (error) {
      console.error('Error unblocking slot:', error);
      toast.error('Failed to unblock time slot');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'no-show':
        return 'text-red-400';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  };
  
const handleCancel = async (id) => {
  try {
    // Usamos patch para manter a consistência com o que já tinhas
    await axios.patch(`${API}/appointments/${id}`, { status: 'cancelled' });
    toast.success('Agendamento cancelado e horário libertado');
    // Nomes corrigidos para as funções que existem no seu ficheiro:
    fetchDashboardData(); 
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error('Erro ao cancelar agendamento');
  }
};

const handleUpdateCustomer = async (e) => {
  e.preventDefault();
  try {
    await axios.put(`${API}/customers/${editingCustomer.id}`, editFormData);
    toast.success('Cliente atualizado com sucesso!');
    setEditingCustomer(null);
    // Nome corrigido para a função que carrega os dados:
    fetchDashboardData(); 
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    toast.error('Erro ao atualizar dados do cliente');
  }
};

  const handleDeleteCustomer = async (id) => {
  if (window.confirm("Tem certeza que deseja excluir este cliente? Isso não removerá o histórico, mas o cliente não aparecerá mais na lista.")) {
    try {
      await axios.delete(`${API}/customers/${id}`);
      toast.success('Cliente removido com sucesso');
      fetchDashboardData(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao remover cliente');
    }
  }
};

const handleDeleteAppointment = async (id) => {
  if (window.confirm("Deseja excluir este agendamento permanentemente?")) {
    try {
      await axios.delete(`${API}/appointments/${id}`);
      toast.success('Agendamento excluído');
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    }
  }
};

  const filteredCustomers = customers.filter(customer => 
  customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  customer.phone.includes(searchTerm)
);
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="admin-sidebar border-b border-[#FFD700]/30">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-[#FFD700] text-3xl font-bold">JHUN BLACK BARBER</h1>
            <p className="text-white/50 text-sm">Admin Dashboard</p>
          </div>
          <Button
            data-testid="logout-btn"
            onClick={handleLogout}
            variant="outline"
            className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Today's Appointments</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">{stats.today_appointments}</h3>
              </div>
              <CalendarIcon className="w-10 h-10 text-[#FFD700]" />
            </div>
          </Card>
          
          <Card className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Total Customers</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">{stats.total_customers}</h3>
              </div>
              <Users className="w-10 h-10 text-[#FFD700]" />
            </div>
          </Card>
          
          <Card className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Monthly Revenue</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">${stats.monthly_revenue}</h3>
              </div>
              <DollarSign className="w-10 h-10 text-[#FFD700]" />
            </div>
          </Card>
          
          <Card className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">This Month</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">{stats.total_appointments}</h3>
              </div>
              <Clock className="w-10 h-10 text-[#FFD700]" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-black border border-[#FFD700]/30">
            <TabsTrigger 
              data-testid="appointments-tab"
              value="appointments" 
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-white"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              data-testid="customers-tab"
              value="customers"
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-white"
            >
              Customers
            </TabsTrigger>
            <TabsTrigger 
              data-testid="block-slots-tab"
              value="block-slots"
              className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-white"
            >
              Block Time Slots
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="bg-black/60 border-white/20 p-6">
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-4">Filter by Date</h2>
                <Calendar
                  mode="multiple" // Mantém a seleção de múltiplos dias
                  selected={selectedDates} // Usa o novo estado
                  onSelect={setSelectedDates} // Usa o novo setter
                  className="rounded-md border border-white/20 bg-black/40 text-white"
                  data-testid="admin-calendar"
                />
              </div>

              <div className="space-y-4">
               <h3 className="text-white text-lg font-bold">
                  {/* Mostra a primeira data selecionada ou 'Today' se nada for selecionado */}
                  Appointments for {
                    selectedDates && selectedDates.length > 0 
                      ? format(selectedDates[0], 'MMMM dd, yyyy') 
                      : format(new Date(), 'MMMM dd, yyyy') // Fallback para data de hoje
                  }
                </h3>
                
                {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="bg-black/60 border-white/20 p-6">
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-4">Filter by Date</h2>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  className="rounded-md border border-white/20 bg-black/40 text-white"
                  data-testid="admin-calendar"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-white text-lg font-bold">
                  Appointments for {
                    selectedDates && selectedDates.length > 0 
                      ? format(selectedDates[0], 'MMMM dd, yyyy') 
                      : format(new Date(), 'MMMM dd, yyyy')
                  }
                </h3>
                
                {appointments.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No appointments for this date</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <Card key={apt.id} className="bg-black border-white/10 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[#FFD700] font-bold text-lg">{apt.time}</span>
                              <span className={`font-bold capitalize ${getStatusColor(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>
                            <h4 className="text-white font-bold">{apt.customer_name}</h4>
                            <p className="text-white/70 text-sm">{apt.customer_phone}</p>
                            <p className="text-white/50 text-sm">{apt.service_name} • {apt.duration_minutes} min</p>
                          </div>

                          <div className="flex gap-2 flex-wrap md:flex-nowrap">
                            {/* Ações para Agendamentos Ativos */}
                            {apt.status === 'scheduled' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                  className="bg-[#00df9a] hover:bg-[#00bf83] text-black gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" /> Complete
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(apt.id, 'no-show')}
                                  variant="outline"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> No-show
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCancel(apt.id)}
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white hover:bg-white/10 gap-2"
                                >
                                  <Ban className="w-4 h-4" /> Cancel
                                </Button>
                              </>
                            )}

                            {/* Ação de Excluir para Limpeza */}
                            {(apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no-show') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar Registo
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="bg-black/60 border-white/20 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-white text-xl font-bold">Customer History</h2>
                  <p className="text-white/50 text-sm">Manage your client database</p>
                </div>
                
                <div className="relative w-full md:w-72">
                  <Input
                    placeholder="Search name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border-white/10 text-white pl-10"
                  />
                  <Users className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                  <p className="text-white/50"> No customers found with "{searchTerm}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="bg-black border-white/10 p-4 hover:border-[#FFD700]/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-white font-bold text-lg">{customer.full_name}</h4>
                          <p className="text-white/70 text-sm flex items-center gap-2">
                            <span className="text-[#FFD700]">📞</span> {customer.phone}
                          </p>
                          {customer.email && (
                            <p className="text-white/50 text-xs">{customer.email}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[#FFD700] font-bold">{customer.total_appointments} visits</p>
                          {customer.last_visit && (
                            <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1">
                              Last: {customer.last_visit}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setEditFormData({
                              full_name: customer.full_name,
                              phone: customer.phone,
                              email: customer.email || ''
                            });
                          }}
                          className="text-[#FFD700] hover:bg-[#FFD700]/10 gap-2"
                        >
                          <Plus className="w-4 h-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-500 hover:bg-red-500/10 gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Block Slots Tab */}
          <TabsContent value="block-slots">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Block New Slot */}
              <Card className="bg-black/60 border-white/20 p-6">
                <h2 className="text-white text-xl font-bold mb-6 flex items-center">
                  <Ban className="w-5 h-5 mr-2 text-[#FFD700]" />
                  Block Time Slot
                </h2>
                
                <form onSubmit={handleBlockSlot} className="space-y-4">
                    
                  <div className="grid grid-cols-2 gap-4"> 
                  <div>
                    <Label htmlFor="start-date" className="text-white">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={blockSlotData.start_date}
                      onChange={(e) => setBlockSlotData({...blockSlotData, start_date: e.target.value})}
                      required
                      className="bg-white/10 border-white/20 text-white mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-white">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={blockSlotData.end_date}
                      onChange={(e) => setBlockSlotData({...blockSlotData, end_date: e.target.value})}
                      required
                      className="bg-white/10 border-white/20 text-white mt-2"
                    />
                  </div>
                </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time" className="text-white">Start Time</Label>
                      <Input
                        id="start-time"
                        data-testid="start-time-input"
                        type="time"
                        value={blockSlotData.start_time}
                        onChange={(e) => setBlockSlotData({...blockSlotData, start_time: e.target.value})}
                        required
                        className="bg-white/10 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time" className="text-white">End Time</Label>
                      <Input
                        id="end-time"
                        data-testid="end-time-input"
                        type="time"
                        value={blockSlotData.end_time}
                        onChange={(e) => setBlockSlotData({...blockSlotData, end_time: e.target.value})}
                        required
                        className="bg-white/10 border-white/20 text-white mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reason" className="text-white">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      data-testid="block-reason-input"
                      value={blockSlotData.reason}
                      onChange={(e) => setBlockSlotData({...blockSlotData, reason: e.target.value})}
                      placeholder="e.g., Family car appointment"
                      className="bg-white/10 border-white/20 text-white mt-2"
                    />
                  </div>
                  
                  <Button
                    data-testid="block-slot-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? 'Blocking...' : 'Block Time Slot'}
                  </Button>
                </form>
              </Card>

              {/* Blocked Slots List */}
              <Card className="bg-black/60 border-white/20 p-6">
                <h2 className="text-white text-xl font-bold mb-6">Currently Blocked Slots</h2>
                
                {blockedSlots.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No blocked slots</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {blockedSlots.map((slot) => (
                      <Card key={slot.id} className="bg-black border-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[#FFD700] font-bold">{slot.date}</p>
                            <p className="text-white">{slot.start_time} - {slot.end_time}</p>
                            {slot.reason && (
                              <p className="text-white/50 text-sm mt-1">{slot.reason}</p>
                            )}
                          </div>
                          <Button
                            data-testid={`unblock-btn-${slot.id}`}
                            size="sm"
                            onClick={() => handleUnblockSlot(slot.id)}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* MODAL DE EDIÇÃO DE CLIENTE */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#111] border-white/10 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Editar Cliente</h3>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <Label className="text-white">Nome Completo</Label>
                <Input 
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                  className="bg-black border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Telefone</Label>
                <Input 
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="bg-black border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white">E-mail</Label>
                <Input 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="bg-black border-white/10 text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFD700]/80">Salvar</Button>
                <Button type="button" onClick={() => setEditingCustomer(null)} variant="outline" className="flex-1 text-white border-white/20">Cancelar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
