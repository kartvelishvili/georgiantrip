import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import CarForm from '@/components/driver/CarForm';

const AdminCarEdit = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();
      
      if (data) setCar(data);
      setLoading(false);
    };
    fetchCar();
  }, [carId]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4 pl-0 hover:bg-transparent hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Edit Vehicle (Admin)</h1>
        </div>
        <Card className="p-6">
            <CarForm 
                driverId={car?.driver_id} 
                car={car}
                isAdmin={true}
                onSuccess={() => navigate('/admin')}
                onCancel={() => navigate('/admin')}
            />
        </Card>
    </div>
  );
};

export default AdminCarEdit;