import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Loader2, Car } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CarCard from '@/components/driver/CarCard';

const DriverCars = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (user) fetchCars();
  }, [user]);

  const fetchCars = async () => {
    setLoading(true);
    try {
        const { data: driver } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (driver) {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('driver_id', driver.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setCars(data || []);
        }
    } catch (error) {
        console.error("Error fetching cars:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load your vehicles.' });
    } finally {
        setLoading(false);
    }
  };

  const handleToggleActive = async (carId, checked) => {
      // Optimistic update
      const originalCars = [...cars];
      setCars(cars.map(c => c.id === carId ? { ...c, active: checked } : c));

      try {
          const { error } = await supabase.from('cars').update({ active: checked }).eq('id', carId);
          if (error) throw error;
          
          toast({ 
              title: checked ? 'Car Activated' : 'Car Deactivated', 
              description: checked ? 'Vehicle is now visible to customers.' : 'Vehicle is hidden from search results.',
              className: checked ? 'bg-green-50 border-green-200' : ''
          });
      } catch (error) {
          setCars(originalCars);
          toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      }
  };

  const handleDelete = async () => {
      if (!deleteId) return;
      try {
          const { error } = await supabase.from('cars').delete().eq('id', deleteId);
          if (error) throw error;
          
          setCars(cars.filter(c => c.id !== deleteId));
          toast({ title: 'Car Deleted Successfully' });
      } catch (error) {
          toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
      } finally {
          setDeleteId(null);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Vehicles</h1>
                <p className="text-gray-500 mt-1">Manage your fleet, update availability, and track status.</p>
            </div>
            <Button 
                onClick={() => navigate('/driver/cars/new')} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-full px-6"
            >
                <Plus className="w-5 h-5 mr-2" /> Add New Car
            </Button>
        </div>

        {/* Content */}
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2, 3].map(i => (
                     <div key={i} className="h-[380px] bg-gray-100 rounded-xl animate-pulse"></div>
                 ))}
             </div>
        ) : cars.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                 <div className="bg-white p-6 rounded-full mb-6 shadow-sm">
                     <Car className="w-16 h-16 text-blue-100 fill-blue-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">No vehicles yet</h2>
                 <p className="text-gray-500 max-w-md mb-8">Add your first vehicle to start accepting transfer requests. It only takes a few minutes.</p>
                 <Button onClick={() => navigate('/driver/cars/new')} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Add Your First Car
                 </Button>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map(car => (
                    <CarCard 
                        key={car.id} 
                        car={car} 
                        onDelete={setDeleteId}
                        onToggleActive={handleToggleActive}
                    />
                ))}
            </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Vehicle</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this vehicle? This action cannot be undone and will cancel any pending bookings for this car.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default DriverCars;