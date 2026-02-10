import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import ProfileDisplay from './ProfileDisplay';
import ProfileEditForm from './ProfileEditForm';

const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [mode, setMode] = useState('view'); // 'view' or 'edit'

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Use maybeSingle() to handle 0 rows gracefully without error
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setDriver(data);
      
      // If no driver profile exists, default to edit mode
      if (!data) setMode('edit');
      else setMode('view');
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // If viewing and data exists
  if (mode === 'view' && driver) {
    return (
        <div className="max-w-5xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">My Profile</h1>
            <ProfileDisplay 
                driver={driver} 
                onEditClick={() => setMode('edit')} 
                onRefresh={fetchProfile}
            />
        </div>
    );
  }

  // If editing (or creating new)
  return (
    <div className="max-w-4xl mx-auto py-6">
        <ProfileEditForm 
            user={user} 
            initialData={driver} 
            onCancel={() => {
                // If canceling creation of new profile (no existing data), stay in edit
                if(driver) setMode('view');
            }} 
            onSuccess={() => {
                fetchProfile(); // Will reset mode to view in fetchProfile
            }} 
        />
    </div>
  );
};

export default MyProfile;