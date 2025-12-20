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
  const [selectedDates, setSelectedDates] = useState([new Date()]);
  const [loading, setLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState([]);

  const [blockSlotData, setBlockSlotData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '12:00',
    reason: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedDates && selectedDates.length > 0) {
      fetchAppointmentsByDate(selectedDates[0]);
    }
  }, [selectedDates]);

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
      toast.error('Erro ao carregar dados do painel');
    }
  };

  const fetchAppointmentsByDate = async (dateToFetch) => {
    try {
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
      await axios.patch(`${API}/appointments/${appointmentId}`, { status: newStatus });
      toast.success('Estado atualizado');
      fetchDashboardData();
      if (selectedDates[0]) fetchAppointmentsByDate(selectedDates[0]);
    } catch (error) {
      toast.error('Erro ao atualizar agendamento');
    }
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/blocked-slots`, blockSlotData);
      toast.success('Horário bloqueado com sucesso');
      fetchDashboardData();
    } catch (error) {
      toast.error('Erro ao bloquear horário');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockSlot = async (slotId) => {
    try {
      await axios.delete(`${API}/blocked-slots/${slotId}`);
      toast.success('Horário desbloqueado');
      fetchDashboardData();
    } catch (error) {
      toast.error('Erro ao desbloquear');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.patch(`${API}/appointments/${id}`, { status: 'cancelled' });
      toast.success('Agendamento cancelado');
      fetchDashboardData();
      if (selectedDates[0]) fetchAppointmentsByDate(selectedDates[0]);
    } catch (error) {
      toast.error('Erro ao cancelar');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/customers/${editingCustomer.id}`, editFormData);
      toast.success('Cliente atualizado com sucesso');
      setEditingCustomer(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Erro ao atualizar dados do cliente');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Deseja mesmo eliminar este cliente?")) {
      try {
        await axios.delete(`${API}/customers/${id}`);
        toast.success('Cliente removido');
        fetchDashboardData();
      } catch (error) {
        toast.error('Erro ao remover cliente');
      }
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("Deseja cancelar este agendamento?")) {
      try {
        // Mudamos de DELETE para PATCH para evitar o erro 405
        await axios.patch(`${API}/appointments/${id}`, { status: 'cancelled' });
        toast.success('Agendamento cancelado com sucesso');
        fetchDashboardData();
        if (selectedDates[0]) fetchAppointmentsByDate(selectedDates[0]);
      } catch (error) {
        console.error('Erro ao cancelar:', error);
        toast.error('O servidor não permitiu excluir. Tente apenas cancelar.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'no-show': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header e Stats */}
      <div className="border-b border-[#FFD700]/30">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-[#FFD700] text-3xl font-bold">JHUN BLACK BARBER</h1>
            <p className="text-white/50 text-sm">Painel de Administração</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Hoje</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">{stats.today_appointments}</h3>
              </div>
              <CalendarIcon className="w-10 h-10 text-[#FFD700]/20" />
            </div>
          </Card>
          <Card className="bg-black/40 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Clientes</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">{stats.total_customers}</h3>
              </div>
              <Users className="w-10 h-10 text-[#FFD700]/20" />
            </div>
          </Card>
          <Card className="bg-black/40 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Faturação Mês</p>
                {/* Alterado para Dólar abaixo */}
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">${stats.monthly_revenue}</h3>
              </div>
              <DollarSign className="w-10 h-10 text-[#FFD700]/20" />
            </div>
          </Card>
          <Card className="bg-black/40 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Total Mês</p>
                <h3 className="text-[#FFD700] text-3xl font-bold mt-2">{stats.total_appointments}</h3>
              </div>
              <Clock className="w-10 h-10 text-[#FFD700]/20" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-black border border-[#FFD700]/30">
            <TabsTrigger value="appointments" className="text-white data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">Agendamentos</TabsTrigger>
            <TabsTrigger value="customers" className="text-white data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">Clientes</TabsTrigger>
            <TabsTrigger value="block-slots" className="text-white data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">Bloqueios</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card className="bg-black/60 border-white/20 p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-white text-xl font-bold mb-4">Filtrar por Data</h2>
                  <Calendar 
                    mode="single" 
                    selected={selectedDates[0]} 
                    onSelect={(d) => d && setSelectedDates([d])} 
                    className="rounded-md border border-white/10 bg-black/40 text-white" 
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-bold border-b border-white/10 pb-2">
                    Agendamentos de {format(selectedDates[0] || new Date(), 'dd/MM/yyyy')}
                  </h3>
                  {appointments.length === 0 ? (
                    <p className="text-white/50 py-8 text-center">Nenhum agendamento para este dia.</p>
                  ) : (
                    appointments.map((apt) => (
                      <Card key={apt.id} className="bg-black border-white/10 p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[#FFD700] font-bold text-lg mr-3">{apt.time}</span>
                              <span className={`text-xs uppercase font-bold ${getStatusColor(apt.status)}`}>{apt.status}</span>
                              <h4 className="text-white font-bold mt-1">{apt.customer_name}</h4>
                              <p className="text-white/50 text-sm">{apt.service_name} • {apt.duration_minutes}min</p>
                            </div>
                          </div>
                          <div className="flex gap-2 border-t border-white/5 pt-3">
                            {apt.status === 'scheduled' && (
                              <>
                                <Button size="sm" onClick={() => handleStatusUpdate(apt.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white flex-1"><CheckCircle className="w-4 h-4 mr-1" /> Concluir</Button>
                                <Button size="sm" onClick={() => handleCancel(apt.id)} variant="outline" className="border-red-500 text-red-500 flex-1"><Ban className="w-4 h-4 mr-1" /> Cancelar</Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteAppointment(apt.id)} className="text-white/30 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="bg-black/60 border-white/20 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-white text-xl font-bold">Histórico de Clientes</h2>
                <div className="relative w-full md:w-72">
                  <Input placeholder="Procurar nome ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/5 border-white/10 text-white pl-10" />
                  <Users className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="bg-black border-white/10 p-4 hover:border-[#FFD700]/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold">{customer.full_name}</h4>
                        <p className="text-[#FFD700] text-sm">{customer.phone}</p>
                        <p className="text-white/40 text-xs mt-1">{customer.total_appointments} visitas</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingCustomer(customer); setEditFormData({ full_name: customer.full_name, phone: customer.phone, email: customer.email || '' }); }} className="text-[#FFD700] hover:bg-[#FFD700]/10"><Plus className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCustomer(customer.id)} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="block-slots">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/60 border-white/20 p-6">
                <h2 className="text-white text-xl font-bold mb-6 flex items-center"><Ban className="w-5 h-5 mr-2 text-[#FFD700]" /> Bloquear Horário</h2>
                <form onSubmit={handleBlockSlot} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Data Início</Label>
                      <Input type="date" value={blockSlotData.start_date} onChange={e => setBlockSlotData({...blockSlotData, start_date: e.target.value})} className="bg-white/5 border-white/20 text-white" required />
                    </div>
                    <div>
                      <Label className="text-white">Data Fim</Label>
                      <Input type="date" value={blockSlotData.end_date} onChange={e => setBlockSlotData({...blockSlotData, end_date: e.target.value})} className="bg-white/5 border-white/20 text-white" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Hora Início</Label>
                      <Input type="time" value={blockSlotData.start_time} onChange={e => setBlockSlotData({...blockSlotData, start_time: e.target.value})} className="bg-white/5 border-white/20 text-white" required />
                    </div>
                    <div>
                      <Label className="text-white">Hora Fim</Label>
                      <Input type="time" value={blockSlotData.end_time} onChange={e => setBlockSlotData({...blockSlotData, end_time: e.target.value})} className="bg-white/5 border-white/20 text-white" required />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold">
                    {loading ? 'A bloquear...' : 'Confirmar Bloqueio'}
                  </Button>
                </form>
              </Card>

              <Card className="bg-black/60 border-white/20 p-6">
                <h2 className="text-white text-xl font-bold mb-4">Horários Bloqueados</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {blockedSlots.length === 0 ? (
                    <p className="text-white/30 text-center py-10">Sem bloqueios ativos.</p>
                  ) : (
                    blockedSlots.map(slot => (
                      <div key={slot.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                        <div>
                          <p className="text-[#FFD700] text-sm font-bold">{slot.date}</p>
                          <p className="text-white text-xs">{slot.start_time} - {slot.end_time}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleUnblockSlot(slot.id)} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL DE EDIÇÃO COMPLETO */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#111] border border-[#FFD700]/30 p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-[#FFD700] w-6 h-6" />
              <h3 className="text-2xl font-bold text-white">Editar Cliente</h3>
            </div>
            <form onSubmit={handleUpdateCustomer} className="space-y-5">
              <div>
                <Label className="text-white mb-2 block">Nome Completo</Label>
                <Input value={editFormData.full_name} onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})} className="bg-black border-white/10 text-white h-12" />
              </div>
              <div>
                <Label className="text-white mb-2 block">Telefone</Label>
                <Input value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="bg-black border-white/10 text-white h-12" />
              </div>
              <div>
                <Label className="text-white mb-2 block">E-mail</Label>
                <Input value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="bg-black border-white/10 text-white h-12" placeholder="opcional@exemplo.com" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFD700]/80 font-bold h-12">Guardar Alterações</Button>
                <Button type="button" onClick={() => setEditingCustomer(null)} variant="outline" className="flex-1 text-white border-white/20 h-12">Cancelar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
