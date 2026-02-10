
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // Check role after login
      const { data: { user } } = await supabase.auth.getUser();
      
      const userRole = user?.user_metadata?.role;
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        navigate('/paneli/dashboard');
      } else {
        navigate('/driver');
      }
      
      toast({ title: 'Welcome back!' });
    } catch (error) {
      // Error handled in signIn
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      // 1. Sign up auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
        options: {
          data: {
            first_name: regData.firstName,
            last_name: regData.lastName,
            role: 'driver'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into drivers table
        const { error: driverError } = await supabase.from('drivers').insert({
          user_id: authData.user.id,
          first_name: regData.firstName,
          last_name: regData.lastName,
          email: regData.email,
          phone: regData.phone,
          verification_status: 'pending'
        });

        if (driverError) {
          console.error('Driver profile creation failed:', driverError);
        }

        toast({ 
          title: 'Registration Successful', 
          description: 'Please check your email to confirm your account.' 
        });
      }
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Registration Failed', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <div 
          onClick={() => navigate('/')}
          className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/20 cursor-pointer"
        >
          <span className="text-white font-heading font-bold text-2xl">GT</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Driver Portal</h1>
        <p className="text-gray-500">Manage your bookings and earnings</p>
      </div>

      <Card className="w-full max-w-md p-6 shadow-xl border-gray-100">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input 
                    value={regData.firstName}
                    onChange={(e) => setRegData({...regData, firstName: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input 
                    value={regData.lastName}
                    onChange={(e) => setRegData({...regData, lastName: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  type="tel"
                  value={regData.phone}
                  onChange={(e) => setRegData({...regData, phone: e.target.value})}
                  required 
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password"
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  required 
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input 
                  type="password"
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                  required 
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                <p>By registering, you agree to submit your vehicle documents for verification.</p>
              </div>

              <Button type="submit" className="w-full bg-gray-900 hover:bg-black" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register as Driver'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      <Button variant="ghost" className="mt-8 text-gray-500" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
};

export default Login;
