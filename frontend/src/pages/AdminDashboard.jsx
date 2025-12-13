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
  const [stats, setStats] = useState({
    today_appointments: 0,
    total_customers: 0,
    monthly_revenue: 0,
    total_appointments: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [blockSlotData, setBlockSlotData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'), // Data de início
    end_date: format(new Date(), 'yyyy-MM-dd'),   // Data de fim
    start_time: '09:00',
    end_time: '12:00',
    reason: ''
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Block slot form
  const [blockSlotData, setBlockSlotData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
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

                          {apt.status === 'scheduled' && (
                            <div className="flex gap-2">
                              <Button
                                data-testid={`complete-btn-${apt.id}`}
                                size="sm"
                                onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                data-testid={`no-show-btn-${apt.id}`}
                                size="sm"
                                onClick={() => handleStatusUpdate(apt.id, 'no-show')}
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                No-show
                              </Button>
                            </div>
                          )}
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
              <h2 className="text-white text-xl font-bold mb-6">Customer History</h2>
              
              {customers.length === 0 ? (
                <p className="text-white/50 text-center py-8">No customers yet</p>
              ) : (
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <Card key={customer.id} className="bg-black border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-bold">{customer.full_name}</h4>
                          <p className="text-white/70 text-sm">{customer.phone}</p>
                          {customer.email && (
                            <p className="text-white/50 text-sm">{customer.email}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[#FFD700] font-bold">{customer.total_appointments} visits</p>
                          {customer.last_visit && (
                            <p className="text-white/50 text-sm">Last: {customer.last_visit}</p>
                          )}
                        </div>
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
                  <div>
                    <Label htmlFor="block-date" className="text-white">Date</Label>
                    <Input
                      id="block-date"
                      data-testid="block-date-input"
                      type="date"
                      value={blockSlotData.date}
                      onChange={(e) => setBlockSlotData({...blockSlotData, date: e.target.value})}
                      required
                      className="bg-white/10 border-white/20 text-white mt-2"
                    />
                    
                  </div>
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
    </div>
  );
}
