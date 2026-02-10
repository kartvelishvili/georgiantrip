import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, MoreHorizontal, Car as CarIcon, Fuel, Power, CheckCircle, Ban } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import CarForm from '@/components/driver/CarForm';
import { updateCarStatus, deleteCar } from '@/lib/carService';

const CarsManagement = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // verification status
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // active status

  const [editingCar, setEditingCar] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    title: '', 
    description: '', 
    action: null 
  });

  useEffect(() => {
    fetchCars();
  }, [statusFilter, availabilityFilter]);

  const fetchCars = async () => {
    setLoading(true);
    let query = supabase
      .from('cars')
      .select(`
        *,
        drivers!inner(id, first_name, last_name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
    }

    if (availabilityFilter === 'active') {
        query = query.eq('active', true);
    } else if (availabilityFilter === 'disabled') {
        query = query.eq('active', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
        let filtered = data || [];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                c.make.toLowerCase().includes(lower) || 
                c.model.toLowerCase().includes(lower) || 
                c.drivers?.first_name.toLowerCase().includes(lower) ||
                c.drivers?.last_name.toLowerCase().includes(lower) ||
                c.license_plate.toLowerCase().includes(lower)
            );
        }
        setCars(filtered);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (carId, status) => {
      const { error } = await supabase.from('cars').update({ verification_status: status }).eq('id', carId);
      if (!error) {
          toast({ title: 'Success', description: `Car marked as ${status}` });
          fetchCars();
      } else {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  };

  const handleDelete = async (carId) => {
      try {
          await deleteCar(carId);
          toast({ title: 'Success', description: 'Car deleted' });
          fetchCars();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  };

  const handleToggleActive = async (carId, currentStatus) => {
      try {
          await updateCarStatus(carId, !currentStatus);
          toast({ title: 'Success', description: `Car ${!currentStatus ? 'enabled' : 'disabled'} successfully` });
          fetchCars();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  };

  const openConfirmDialog = (title, description, action) => {
      setConfirmDialog({ open: true, title, description, action });
  };

  const executeConfirmAction = async () => {
      if (confirmDialog.action) {
          await confirmDialog.action();
      }
      setConfirmDialog({ ...confirmDialog, open: false });
  };

  return (
    <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Search by model, plate, or driver..." 
                    className="pl-10 h-10 bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchCars()}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-10 bg-gray-50 border-gray-200"><SelectValue placeholder="Verification" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Verifications</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="w-[180px] h-10 bg-gray-50 border-gray-200"><SelectValue placeholder="Availability" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Availability</SelectItem>
                        <SelectItem value="active">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={fetchCars} className="bg-gray-900 text-white h-10"><Filter className="w-4 h-4 mr-2" /> Apply</Button>
            </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-4">
            {loading ? (
                 <div className="text-center py-12 bg-white rounded-xl border border-gray-100">Loading cars...</div>
            ) : cars.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">No cars found matching criteria.</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Specs</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cars.map(car => (
                                <tr key={car.id} className={`hover:bg-gray-50/50 transition-colors ${!car.active ? 'bg-gray-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 relative">
                                                {car.main_photo ? (
                                                    <img src={car.main_photo} className={`w-full h-full object-cover ${!car.active ? 'grayscale' : ''}`} alt={car.model} />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-gray-400">No Pic</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                                                    {car.make} {car.model}
                                                    {!car.active && <Badge variant="secondary" className="text-[10px] h-4 px-1">Disabled</Badge>}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">{car.license_plate}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{car.drivers?.first_name} {car.drivers?.last_name}</div>
                                        <div className="text-xs text-gray-500">{car.drivers?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"><CarIcon className="w-3 h-3"/> {car.year}</span>
                                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"><Fuel className="w-3 h-3"/> {car.fuel_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            {/* Active Status */}
                                            {car.active ? (
                                                <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-none gap-1">
                                                    <CheckCircle className="w-3 h-3"/> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-200 text-gray-600 border-0 shadow-none gap-1">
                                                    <Ban className="w-3 h-3"/> Disabled
                                                </Badge>
                                            )}
                                            
                                            {/* Verification Status */}
                                            <span className="text-xs text-gray-400 font-medium">
                                                {car.verification_status === 'approved' && <span className="text-green-600">Verified</span>}
                                                {car.verification_status === 'pending' && <span className="text-yellow-600">Pending Review</span>}
                                                {car.verification_status === 'rejected' && <span className="text-red-600">Rejected</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4 text-gray-400" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => { setEditingCar(car); setIsEditDialogOpen(true); }}>
                                                    Edit Details
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuItem onClick={() => openConfirmDialog(
                                                    car.active ? "Disable Car" : "Enable Car",
                                                    `Are you sure you want to ${car.active ? "disable" : "enable"} this ${car.make} ${car.model}? ${car.active ? "It will disappear from search results." : "It will appear in search results."}`,
                                                    () => handleToggleActive(car.id, car.active)
                                                )}>
                                                    <Power className="w-4 h-4 mr-2" />
                                                    {car.active ? 'Disable' : 'Enable'}
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(car.id, 'approved')} className="text-green-600">
                                                    Mark Approved
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(car.id, 'rejected')} className="text-red-600">
                                                    Mark Rejected
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem onClick={() => openConfirmDialog(
                                                    "Delete Car",
                                                    "Are you sure you want to permanently delete this car? This action cannot be undone.",
                                                    () => handleDelete(car.id)
                                                )} className="text-red-600 bg-red-50 hover:bg-red-100">
                                                    Delete Permanently
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Vehicle Details</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[80vh] px-6 py-4">
                    {editingCar && (
                        <CarForm 
                            driverId={editingCar.driver_id} 
                            car={editingCar} 
                            isAdmin={true}
                            onSuccess={() => { setIsEditDialogOpen(false); fetchCars(); }} 
                            onCancel={() => setIsEditDialogOpen(false)} 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{confirmDialog.title}</DialogTitle>
                    <DialogDescription>{confirmDialog.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
                    <Button onClick={executeConfirmAction} className="bg-green-600 hover:bg-green-700">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default CarsManagement;