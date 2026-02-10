import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Car, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const MyCars = () => {
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
        // 1. Get Driver ID (and cars)
        const { data: driver } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (driver) {
            // 2. Get Cars
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('driver_id', driver.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setCars(data || []);
        } else {
            // No driver record yet, so no cars
            setCars([]);
        }
    } catch (error) {
        console.error("Error fetching cars:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load your vehicles.' });
    } finally {
        setLoading(false);
    }
  };

  const handleAddCar = () => {
      navigate('/driver/cars/new');
  };

  const handleToggleActive = async (carId, currentState) => {
      // Optimistic update
      setCars(cars.map(c => c.id === carId ? { ...c, active: !currentState } : c));

      const { error } = await supabase.from('cars').update({ active: !currentState }).eq('id', carId);
      if (error) {
          // Revert if error
          setCars(cars.map(c => c.id === carId ? { ...c, active: currentState } : c));
          toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      } else {
          toast({ title: !currentState ? 'Car Activated' : 'Car Deactivated', description: !currentState ? 'Your car is now visible in search results.' : 'Your car is now hidden.' });
      }
  };

  const handleDelete = async () => {
      if (!deleteId) return;
      
      const { error } = await supabase.from('cars').delete().eq('id', deleteId);
      if (error) {
          toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
      } else {
          setCars(cars.filter(c => c.id !== deleteId));
          toast({ title: 'Car Deleted Successfully' });
      }
      setDeleteId(null);
  };

  const getStatusBadge = (car) => {
      if (!car.active) return <Badge variant="secondary" className="bg-gray-500 text-white border-0">Inactive</Badge>;
      
      const isComplete = car.main_photo && car.gallery_images?.length >= 3;
      
      if (isComplete) return <Badge className="bg-green-600 text-white border-0">Active & Published</Badge>;
      return <Badge className="bg-amber-500 text-white border-0">Active (Pending Info)</Badge>;
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold">My Vehicles</h1>
                <p className="text-gray-500 text-sm">Manage your fleet and availability</p>
            </div>
            <Button onClick={handleAddCar} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" /> Add New Car
            </Button>
        </div>

        {cars.length === 0 ? (
             <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 bg-gray-50/50">
                 <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
                     <Car className="w-12 h-12 text-gray-400" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">No cars added yet</h3>
                 <p className="text-gray-500 max-w-sm mb-6">Add your first vehicle to start accepting bookings. Make sure you have clear photos ready.</p>
                 <Button onClick={handleAddCar} className="bg-green-600">
                    Add Your First Car
                 </Button>
             </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map(car => (
                    <Card key={car.id} className="overflow-hidden flex flex-col group border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
                        <div className="relative h-48 bg-gray-200 group-hover:opacity-95 transition-opacity">
                            {car.main_photo ? (
                                <img src={car.main_photo} alt={car.model} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                    <div className="text-center">
                                        <Car className="w-8 h-8 mx-auto mb-1 opacity-20"/>
                                        <span className="text-xs">No Image</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Status Badges Overlay */}
                            <div className="absolute top-2 left-2 flex gap-2">
                                {getStatusBadge(car)}
                            </div>
                            
                            <div className="absolute top-2 right-2">
                                {car.verification_status === 'approved' && <Badge className="bg-white/90 text-green-700 hover:bg-white"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>}
                                {car.verification_status === 'pending' && <Badge className="bg-white/90 text-yellow-700 hover:bg-white"><AlertTriangle className="w-3 h-3 mr-1"/> Verification Pending</Badge>}
                                {car.verification_status === 'rejected' && <Badge className="bg-white/90 text-red-700 hover:bg-white"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>}
                            </div>
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{car.make} {car.model}</h3>
                                <span className="text-gray-500 text-sm font-medium">{car.year}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit mb-4">{car.license_plate}</p>
                            
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2"><Car className="w-4 h-4 text-gray-400" /> {car.seats} Seats</div>
                                <div className="flex items-center gap-2"><span className="w-4 text-center text-xs font-bold text-gray-400 border border-gray-300 rounded">T</span> {car.transmission}</div>
                                <div className="flex items-center gap-2"><span className="w-4 text-center text-xs font-bold text-gray-400 border border-gray-300 rounded">F</span> {car.fuel_type}</div>
                                <div className="flex items-center gap-2">🎒 {car.luggage_capacity || 0} Bags</div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Switch 
                                        checked={car.active} 
                                        onCheckedChange={() => handleToggleActive(car.id, car.active)}
                                    />
                                    <span className={`text-xs font-medium ${car.active ? 'text-green-600' : 'text-gray-500'}`}>
                                        {car.active ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" asChild title="Edit Car">
                                        <Link to={`/driver/cars/${car.id}/edit`}><Edit className="w-4 h-4 text-gray-600" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(car.id)} title="Delete Car" className="hover:text-red-600 text-gray-400 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )}

        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Vehicle?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this car? This action cannot be undone and will remove it from search results.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default MyCars;