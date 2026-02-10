import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
    ArrowLeft, Edit, Trash2, Loader2, CheckCircle2, 
    AlertTriangle, XCircle, MapPin, Check, X 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CarGallery from '@/components/driver/CarGallery';
import CarSpecsGrid from '@/components/driver/CarSpecsGrid';

const DriverCarDetails = () => {
    const { carId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    
    // Checklist items
    const [driverVerified, setDriverVerified] = useState(false);
    const [pricingConfigured, setPricingConfigured] = useState(false);

    useEffect(() => {
        if (user && carId) fetchCarDetails();
    }, [user, carId]);

    const fetchCarDetails = async () => {
        setLoading(true);
        try {
            // Fetch Car
            const { data: carData, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', carId)
                .single();
            
            if (error) throw error;
            setCar(carData);

            // Fetch requirements status
            const { data: driver } = await supabase
                .from('drivers')
                .select('verification_status')
                .eq('user_id', user.id)
                .single();
            setDriverVerified(driver?.verification_status === 'approved');

            const { data: pricing } = await supabase
                .from('driver_pricing')
                .select('id')
                .eq('driver_id', carData.driver_id)
                .maybeSingle();
            
            // Check global settings if individual pricing not required
            const { data: global } = await supabase
                .from('admin_settings')
                .select('driver_price_override_enabled')
                .maybeSingle();
            
            setPricingConfigured(!!pricing || !global?.driver_price_override_enabled);

        } catch (error) {
            console.error("Error fetching details:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load car details.' });
            navigate('/driver/cars');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (checked) => {
        const originalState = car.active;
        setCar({...car, active: checked}); // Optimistic
        
        const { error } = await supabase
            .from('cars')
            .update({ active: checked })
            .eq('id', carId);

        if (error) {
            setCar({...car, active: originalState});
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
            toast({ 
                title: checked ? 'Car Published' : 'Car Hidden',
                description: checked ? 'Visible to customers.' : 'Hidden from search results.',
                className: checked ? 'bg-green-50 border-green-200' : ''
            });
        }
    };

    const handleDelete = async () => {
        const { error } = await supabase.from('cars').delete().eq('id', carId);
        if (error) {
            toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
        } else {
            toast({ title: 'Car Deleted' });
            navigate('/driver/cars');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    if (!car) return null;

    // Check completeness
    const isComplete = car.main_photo && car.gallery_images?.length >= 3 && driverVerified && pricingConfigured;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/driver/cars')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{car.make} {car.model}</h1>
                        <p className="text-gray-500 text-sm font-mono">{car.year} • {car.license_plate}</p>
                    </div>
                    {/* Status Badges */}
                    <div className="hidden md:flex gap-2 ml-4">
                        {car.active 
                            ? <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">Published</Badge>
                            : <Badge variant="secondary">Hidden</Badge>
                        }
                        {car.verification_status === 'approved' && <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">Verified</Badge>}
                        {car.verification_status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200">Pending Verification</Badge>}
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => navigate(`/driver/cars/${carId}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Car
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteModalOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Gallery */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-1 border-0 shadow-none bg-transparent">
                        <CarGallery 
                            images={car.gallery_images} 
                            mainImage={car.main_photo} 
                            title={`${car.make} ${car.model}`} 
                        />
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {car.description || <span className="italic text-gray-400">No description provided.</span>}
                        </p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Features</h3>
                        {car.features && car.features.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {car.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-2 text-gray-700">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No specific features listed.</p>
                        )}
                    </Card>
                </div>

                {/* Right Column - Details & Status */}
                <div className="space-y-6">
                    {/* Specs Card */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Specifications</h3>
                        <CarSpecsGrid 
                            seats={car.seats} 
                            luggage={car.luggage_capacity} 
                            transmission={car.transmission} 
                            fuel={car.fuel_type} 
                        />
                    </Card>

                    {/* Publish Status Card */}
                    <Card className={`p-6 border-l-4 ${isComplete ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-900">Publish Status</h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${car.active ? 'text-green-600' : 'text-gray-500'}`}>
                                    {car.active ? 'Visible' : 'Hidden'}
                                </span>
                                <Switch 
                                    checked={car.active} 
                                    onCheckedChange={handleToggleActive}
                                    disabled={!isComplete}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <RequirementItem label="Driver Verified" met={driverVerified} />
                            <RequirementItem label="Main Photo Uploaded" met={!!car.main_photo} />
                            <RequirementItem label="Gallery Photos (3+)" met={car.gallery_images?.length >= 3} />
                            <RequirementItem label="Pricing Configured" met={pricingConfigured} />
                        </div>

                        {!isComplete && (
                            <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg flex gap-2 items-start">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Complete all requirements above to publish your car.</span>
                            </div>
                        )}
                    </Card>

                    {/* Pricing Summary (Read Only) */}
                    <Card className="p-6 bg-gray-50 border-gray-200">
                         <h3 className="font-bold text-gray-900 mb-2">Pricing</h3>
                         <p className="text-sm text-gray-500 mb-4">Base rates controlled via Pricing page.</p>
                         <Button variant="outline" className="w-full bg-white" onClick={() => navigate('/driver/pricing')}>
                            Manage Pricing
                         </Button>
                    </Card>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {car.make} {car.model}?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All future bookings for this vehicle will be cancelled automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const RequirementItem = ({ label, met }) => (
    <div className="flex items-center justify-between text-sm">
        <span className={met ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
        {met ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-300" />}
    </div>
);

export default DriverCarDetails;