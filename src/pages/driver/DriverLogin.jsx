import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const DriverLogin = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Register State
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
    languages: []
  });

  useEffect(() => {
    // Check for saved email
    const savedEmail = localStorage.getItem('driver_email');
    if (savedEmail) {
        setLoginEmail(savedEmail);
        setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (rememberMe) {
        localStorage.setItem('driver_email', loginEmail);
    } else {
        localStorage.removeItem('driver_email');
    }

    const { error } = await signIn(loginEmail, loginPassword);
    
    setLoading(false);
    
    if (!error) {
      toast({ title: 'Welcome back!', description: 'Redirecting to dashboard...' });
      navigate('/driver/dashboard');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(regForm.password)) {
        toast({ variant: 'destructive', title: 'Weak Password', description: 'Password must be at least 8 characters and contain both letters and numbers.' });
        return;
    }
    if (regForm.password !== regForm.confirmPassword) {
        toast({ variant: 'destructive', title: 'Passwords do not match' });
        return;
    }
    const phoneRegex = /^\+995[0-9]{9}$/;
    if (!regForm.phone.startsWith('+995')) {
        toast({ variant: 'destructive', title: 'Invalid Phone Format', description: 'Phone must start with +995...' });
        return;
    }
    if (regForm.languages.length === 0) {
        toast({ variant: 'destructive', title: 'Language Required', description: 'Select at least one language.' });
        return;
    }
    if (!regForm.terms) {
        toast({ variant: 'destructive', title: 'Terms Required', description: 'Please accept terms & conditions.' });
        return;
    }

    setLoading(true);
    
    // 1. Create Auth User
    const { data: authData, error: authError } = await signUp(regForm.email, regForm.password, {
        data: {
            role: 'driver',
            first_name: regForm.firstName,
            last_name: regForm.lastName
        }
    });

    if (authError) {
        toast({ variant: 'destructive', title: 'Registration Failed', description: authError.message });
        setLoading(false);
        return;
    }

    if (authData?.user) {
        // 2. Create Driver Profile
        const { error: dbError } = await supabase.from('drivers').insert({
            user_id: authData.user.id,
            first_name: regForm.firstName,
            last_name: regForm.lastName,
            email: regForm.email,
            phone: regForm.phone,
            languages_spoken: regForm.languages,
            status: 'pending_verification',
            verification_status: 'pending'
        });

        if (dbError) {
            toast({ variant: 'destructive', title: 'Profile Creation Failed', description: dbError.message });
        } else {
            toast({ title: 'Registration Successful', description: 'Please upload your documents.' });
            navigate('/driver/verify');
        }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter your email address.' });
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/driver/settings`,
    });
    setLoading(false);
    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
        toast({ title: 'Email Sent', description: 'Check your inbox for the password reset link.' });
        setForgotPasswordOpen(false);
    }
  };

  const toggleLanguage = (lang) => {
      setRegForm(prev => {
          const langs = prev.languages.includes(lang) 
             ? prev.languages.filter(l => l !== lang)
             : [...prev.languages, lang];
          return { ...prev, languages: langs };
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Driver Portal</h2>
                <p className="mt-2 text-sm text-gray-600">Join our network of professional drivers</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email address</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                required 
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <button type="button" onClick={() => setForgotPasswordOpen(true)} className="text-xs text-green-600 hover:text-green-500 font-medium">Forgot password?</button>
                            </div>
                            <div className="relative mt-1">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <input 
                                id="remember-me" 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11 text-base" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            Sign In
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>First Name</Label>
                                <Input required value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} />
                            </div>
                            <div>
                                <Label>Last Name</Label>
                                <Input required value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} />
                            </div>
                        </div>
                        
                        <div>
                            <Label>Phone (+995...)</Label>
                            <Input required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="+995 5XX XX XX XX" />
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input required type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                        </div>

                        <div className="relative">
                            <Label>Password (min 8 chars)</Label>
                            <Input required type={showPassword ? "text" : "password"} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div>
                            <Label>Confirm Password</Label>
                            <Input required type="password" value={regForm.confirmPassword} onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})} />
                        </div>

                        <div>
                            <Label className="mb-2 block">Languages Spoken</Label>
                            <div className="flex gap-4">
                                {['EN', 'RU', 'KA'].map(lang => (
                                    <label key={lang} className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded border border-gray-200 hover:bg-gray-50">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${regForm.languages.includes(lang) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                                            {regForm.languages.includes(lang) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={regForm.languages.includes(lang)} onChange={() => toggleLanguage(lang)} />
                                        <span>{lang}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                             <input 
                                type="checkbox" 
                                id="terms" 
                                required
                                checked={regForm.terms}
                                onChange={e => setRegForm({...regForm, terms: e.target.checked})}
                                className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                             />
                             <Label htmlFor="terms" className="text-xs text-gray-600 mb-0 cursor-pointer">I agree to the <a href="#" className="text-green-600 hover:underline">Terms & Conditions</a></Label>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            Create Account
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </Card>

        {/* Forgot Password Modal */}
        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>Enter your email address and we'll send you a link to reset your password.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label>Email Address</Label>
                    <Input 
                        placeholder="name@example.com" 
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
                    <Button onClick={handleForgotPassword} className="bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Reset Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default DriverLogin;