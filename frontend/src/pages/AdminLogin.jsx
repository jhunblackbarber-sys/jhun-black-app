import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, { password });
      
      if (response.data.success) {
        localStorage.setItem('admin_token', response.data.token);
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Button
          data-testid="back-home-link"
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-[#FFD700] hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 bg-black border-[#FFD700]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFD700] flex items-center justify-center">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-[#FFD700] text-3xl font-bold">ADMIN LOGIN</h1>
            <p className="text-white/50 mt-2">Jhun Black Barber Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                data-testid="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Enter admin password"
              />
            </div>

            <Button
              data-testid="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFD700] hover:bg-[#FFC107] text-black font-bold py-6 text-lg"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}