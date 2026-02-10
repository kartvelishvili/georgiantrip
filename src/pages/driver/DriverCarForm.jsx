import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import CarForm from '@/components/driver/CarForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DriverCarFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const ensureDriverRecord = async () => {
          if (!user) return;
          setLoading(true);
          
          try {
              // 1. Check if driver record exists
              const { data: existingDriver } = await supabase
                  .from('drivers')
                  .select('id')
                  .eq('user_id', user.id)
                  .maybeSingle();

              if (existingDriver) {
                  setDriverId(existingDriver.id);
              } else {
                  // 2. If not, create a placeholder record
                  // This requires the INSERT RLS policy to be active
                  const { data: newDriver, error } = await supabase
                      .from('drivers')
                      .insert({ 
                          user_id: user.id, 
                          email: user.email,
                          first_name: '', 
                          last_name: '',
                          phone: ''
                      })
                      .select('id')
                      .single();
                  
                  if (error) {
                      console.error("Error creating driver placeholder:", error);
                      // If insert fails (e.g. race condition), try fetching one last time
                      const { data: retryDriver } = await supabase
                          .from('drivers')
                          .select('id')
                          .eq('user_id', user.id)
                          .maybeSingle();
                          
                      if (retryDriver) setDriverId(retryDriver.id);
                  } else if (newDriver) {
                      setDriverId(newDriver.id);
                  }
              }
          } catch (error) {
              console.error("Error initializing driver for car form:", error);
          } finally {
              setLoading(false);
          }
      };
      
      ensureDriverRecord();
  }, [user]);

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
      );
  }

  if (!driverId) {
      return (
          <div className="max-w-4xl mx-auto py-6">
              <Card className="p-8 text-center text-red-500 border-red-100 bg-red-50">
                  <h2 className="text-xl font-bold mb-2">Account Initialization Failed</h2>
                  <p>We couldn't prepare your driver account. Please try refreshing the page.</p>
              </Card>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate('/driver/cars')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Cars
        </Button>
        <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>
            <CarForm 
                driverId={driverId}
                onSuccess={() => navigate('/driver/cars')}
                onCancel={() => navigate('/driver/cars')}
            />
        </Card>
    </div>
  );
};

export default DriverCarFormPage;