
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, user, isAdmin, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/paneli/dashboard';
  const accessError = location.state?.error;

  // Handle existing sessions on mount
  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        // Already logged in as admin
        navigate(from, { replace: true });
      } else {
        // Logged in as non-admin (e.g. driver). Force logout so they can login as admin.
        signOut();
        if (accessError === 'unauthorized') {
            setError("Access denied: You need administrator privileges to view that page.");
        }
      }
    }
  }, [user, isAdmin, authLoading, navigate, from, signOut, accessError]);

  const getErrorMessage = (err) => {
    if (!err) return "Authentication failed";
    const msg = err.message || "";
    
    if (msg.includes("Invalid login credentials")) return "Invalid email or password. Please try again.";
    if (msg.includes("Email not confirmed")) return "Your email is not confirmed. Please check your inbox.";
    return msg;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter both email and password');
      }

      // 1. Attempt Sign In
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) throw signInError;

      if (!data?.user) {
        throw new Error("Login failed. No user data returned.");
      }

      // 2. Check Admin Role Immediately
      const role = data.user.user_metadata?.role;
      
      if (role !== 'admin' && role !== 'super_admin') {
         // User exists but is not admin
         await signOut();
         throw new Error("You do not have admin access permissions.");
      }

      // 3. Success
      navigate(from, { replace: true });
      
    } catch (err) {
      setError(getErrorMessage(err));
      // If validation failed locally or auth failed, we stay here
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-900/10 mx-auto mb-4">
            <span className="text-white font-heading font-bold text-2xl">GT</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Admin Panel Access</h1>
          <p className="text-gray-500 mt-2">Sign in to manage GeorgianTrip platform</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>
              Enter your administrative credentials below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@georgiantrip.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if(error) setError(null);
                    }}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if(error) setError(null);
                    }}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 h-11 text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Login to Dashboard <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50/50 p-6 rounded-b-xl border-t">
            <p className="text-xs text-center text-gray-500 w-full">
              Protected area. Unauthorized access is monitored and logged.
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Back to Main Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
