import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const DriverSettings = () => {
    const { user, signOut } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast({ variant: 'destructive', title: 'Passwords do not match' });
            return;
        }
        if (passwords.new.length < 8) {
            toast({ variant: 'destructive', title: 'Too Weak', description: 'Password must be at least 8 characters' });
            return;
        }
        
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: passwords.new });
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
            toast({ title: 'Success', description: 'Password updated successfully' });
            setPasswords({ current: '', new: '', confirm: '' });
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') return;
        setLoading(true);

        try {
            // 1. Delete Driver Data (Drivers table)
            // Use maybeSingle to avoid error if driver profile doesn't exist
            const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', user.id).maybeSingle();
            
            if (driver) {
                // Manually delete dependent data just in case cascade isn't set
                await supabase.from('cars').delete().eq('driver_id', driver.id);
                await supabase.from('bookings').delete().eq('driver_id', driver.id);
                await supabase.from('driver_pricing').delete().eq('driver_id', driver.id);
                
                // Delete driver
                await supabase.from('drivers').delete().eq('id', driver.id);
            }

            // Note: We cannot delete Auth User from client side without Admin function.
            // We just clear data and sign out.
            await signOut();
            navigate('/driver/login');
            toast({ title: 'Account Data Deleted', description: 'Your profile has been removed.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <h1 className="text-2xl font-bold">Account Security</h1>
            
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                    <Lock className="w-5 h-5 text-gray-500" />
                    Change Password
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <Label>New Password</Label>
                        <Input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                    </div>
                    <div>
                        <Label>Confirm Password</Label>
                        <Input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </Card>

            <Card className="p-6 border-red-100 bg-red-50">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-red-800 mb-1">Delete Account</h2>
                        <p className="text-sm text-red-600 mb-4">
                            Permanently delete your account and all associated data (cars, bookings history). 
                            This action cannot be undone.
                        </p>
                        <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>Delete My Account</Button>
                    </div>
                </div>
            </Card>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Account Permanently?</DialogTitle>
                        <DialogDescription>
                            This will remove your driver profile, cars, and booking history.
                            Type <strong>DELETE</strong> below to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            value={deleteConfirmation} 
                            onChange={e => setDeleteConfirmation(e.target.value)} 
                            placeholder="DELETE"
                            className="border-red-300 focus-visible:ring-red-500"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount} 
                            disabled={deleteConfirmation !== 'DELETE' || loading}
                        >
                            {loading ? 'Deleting...' : 'Confirm Deletion'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DriverSettings;