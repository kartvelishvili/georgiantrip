import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhotoUpload from './PhotoUpload';
import { X, Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const CarForm = ({ driverId, car, onSuccess, onCancel, isAdmin = false }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [driverStatus, setDriverStatus] = useState(null);
  const [pricingExists, setPricingExists] = useState(false);
  const [adminDrivers, setAdminDrivers] = useState([]);

  const [formData, setFormData] = useState({
    driver_id: driverId,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    seats: 4,
    luggage_capacity: 2,
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    description: '',
    active: false,
    verification_status: 'pending',
    main_photo: '',
    gallery_images: [],
    features: [],
    admin_notes: ''
  });

  useEffect(() => {
    const checkRequirements = async () => {
        // Fetch driver status
        const { data: driver } = await supabase.from('drivers').select('verification_status').eq('id', formData.driver_id || driverId).maybeSingle();
        setDriverStatus(driver?.verification_status);

        // Fetch pricing status
        const { data: pricing } = await supabase.from('driver_pricing').select('id').eq('driver_id', formData.driver_id || driverId).maybeSingle();
        const { data: global } = await supabase.from('admin_settings').select('driver_price_override_enabled').maybeSingle();
        
        setPricingExists(!!pricing || !global?.driver_price_override_enabled); 
    };
    if (driverId || formData.driver_id) checkRequirements();

    if (isAdmin) {
        const fetchDrivers = async () => {
            const { data } = await supabase.from('drivers').select('id, first_name, last_name, email');
            setAdminDrivers(data || []);
        };
        fetchDrivers();
    }

    if (car) {
      setFormData({
        driver_id: car.driver_id || driverId,
        make: car.make || '',
        model: car.model || '',
        year: car.year || new Date().getFullYear(),
        license_plate: car.license_plate || '',
        seats: car.seats || 4,
        luggage_capacity: car.luggage_capacity || 0,
        transmission: car.transmission || 'Automatic',
        fuel_type: car.fuel_type || 'Petrol',
        description: car.description || '',
        active: car.active ?? false,
        verification_status: car.verification_status || 'pending',
        main_photo: car.main_photo || '',
        gallery_images: car.gallery_images || car.photos_urls || [],
        features: car.features || [],
        admin_notes: car.admin_notes || ''
      });
    }
  }, [car, driverId, isAdmin]);

  const validate = async () => {
      const errors = [];
      const currentYear = new Date().getFullYear();

      if (!formData.make?.trim()) errors.push("Brand/Make is required");
      if (!formData.model?.trim()) errors.push("Model is required");
      if (!formData.license_plate?.trim()) errors.push("License plate is required");
      if (formData.year < 1990 || formData.year > currentYear + 1) errors.push("Invalid Year");
      if (formData.seats < 1 || formData.seats > 15) errors.push("Seats must be between 1-15");
      if (formData.luggage_capacity === '' || formData.luggage_capacity < 0) errors.push("Luggage capacity is required");
      if (!formData.main_photo) errors.push("Main photo is required");
      if (formData.gallery_images.length < 3) errors.push("At least 3 gallery photos required");

      if (formData.license_plate) {
          let query = supabase.from('cars').select('id').eq('license_plate', formData.license_plate);
          if (car?.id) query = query.neq('id', car.id);
          const { data } = await query;
          if (data && data.length > 0) errors.push("License plate already exists");
      }

      return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // 1. Validation
    const validationErrors = await validate();
    if (validationErrors.length > 0) {
        toast({ 
            variant: 'destructive', 
            title: 'Validation Failed', 
            description: validationErrors[0] 
        });
        setSaving(false);
        return;
    }

    // 2. Auto-Publish Calculation
    const checklist = {
      driverVerified: driverStatus === 'approved',
      detailsComplete: !!formData.make && !!formData.model && !!formData.license_plate,
      mainPhoto: !!formData.main_photo,
      galleryPhotos: formData.gallery_images.length >= 3,
      pricing: pricingExists
    };
    const requirementsMet = Object.values(checklist).every(Boolean);

    // If new car and requirements met, active = true. 
    // If updating, respect current active status UNLESS requirements fail, then force false.
    let finalActive = formData.active;
    
    if (!car && requirementsMet) {
        finalActive = true;
    } else if (!requirementsMet && !isAdmin) {
        // Force inactive if missing requirements (unless admin overrides)
        finalActive = false;
    }

    const payload = { 
        ...formData, 
        driver_id: formData.driver_id || driverId,
        photos_urls: formData.gallery_images, // Legacy support
        active: finalActive,
        updated_at: new Date().toISOString()
    };

    let error;
    if (car?.id) {
        const { error: err } = await supabase.from('cars').update(payload).eq('id', car.id);
        error = err;
    } else {
        // New car - set defaults
        payload.verification_status = isAdmin ? payload.verification_status : 'pending';
        const { error: err } = await supabase.from('cars').insert(payload);
        error = err;
    }

    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
        const message = requirementsMet && finalActive 
            ? "Car published successfully! It is now visible to customers." 
            : "Car saved. Complete all requirements to publish.";
        
        toast({ 
            title: requirementsMet ? 'Success' : 'Saved (Pending Publish)', 
            description: message,
            className: requirementsMet ? 'bg-green-50 border-green-200' : ''
        });
        onSuccess();
    }
    setSaving(false);
  };

  const toggleFeature = (feature) => {
      setFormData(prev => ({
          ...prev,
          features: prev.features.includes(feature) 
              ? prev.features.filter(f => f !== feature)
              : [...prev.features, feature]
      }));
  };

  const removeGalleryPhoto = (index) => {
    const newPhotos = [...formData.gallery_images];
    newPhotos.splice(index, 1);
    setFormData({...formData, gallery_images: newPhotos});
  };

  // Checklist for UI
  const checklist = {
      driverVerified: driverStatus === 'approved',
      detailsComplete: !!formData.make && !!formData.model && !!formData.license_plate,
      mainPhoto: !!formData.main_photo,
      galleryPhotos: formData.gallery_images.length >= 3,
      pricing: pricingExists
  };
  const isReady = Object.values(checklist).every(Boolean);

  return (
    <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
            {/* Admin Controls */}
            {isAdmin && (
                <Card className="p-4 bg-purple-50 border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3">Admin Controls</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Owner Driver</Label>
                            <Select 
                                value={formData.driver_id} 
                                onValueChange={v => setFormData({...formData, driver_id: v})}
                            >
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Driver" /></SelectTrigger>
                                <SelectContent>
                                    {adminDrivers.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Verification Status</Label>
                            <Select 
                                value={formData.verification_status} 
                                onValueChange={v => setFormData({...formData, verification_status: v})}
                            >
                                <SelectTrigger className={`bg-white font-medium ${formData.verification_status === 'approved' ? 'text-green-700' : 'text-amber-700'}`}><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Brand / Make <span className="text-red-500">*</span></Label><Input value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" /></div>
                <div><Label>Model <span className="text-red-500">*</span></Label><Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Camry" /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Year <span className="text-red-500">*</span></Label><Input type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} /></div>
                <div><Label>License Plate <span className="text-red-500">*</span></Label><Input value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value})} placeholder="GE-000-AA" /></div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Transmission <span className="text-red-500">*</span></Label>
                    <Select value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Fuel Type <span className="text-red-500">*</span></Label>
                    <Select value={formData.fuel_type} onValueChange={v => setFormData({...formData, fuel_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="LPG">LPG</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div><Label>Seats (incl. driver) <span className="text-red-500">*</span></Label><Input type="number" min="1" max="15" value={formData.seats} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} /></div>
                 <div><Label>Luggage Bags <span className="text-red-500">*</span></Label><Input type="number" min="0" max="20" value={formData.luggage_capacity} onChange={e => setFormData({...formData, luggage_capacity: parseInt(e.target.value)})} /></div>
            </div>

            {/* Features */}
            <div>
                <Label className="mb-2 block">Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['AC', 'WiFi', 'Child Seat', 'USB Charging', 'Water', 'English Speaking', 'Roof Box', 'Leather Seats'].map(feat => (
                        <label key={feat} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" checked={formData.features.includes(feat)} onChange={() => toggleFeature(feat)} className="rounded text-green-600 focus:ring-green-600" />
                            {feat}
                        </label>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <Label>Description</Label>
                <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Describe your car's condition and comfort..."
                    rows={3}
                />
            </div>

            {/* Active Switch */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${formData.active ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div>
                    <Label htmlFor="active-mode" className="mb-0 cursor-pointer">Active Status</Label>
                    <p className="text-xs text-gray-500">
                        {isReady ? "Visible to customers when active" : "Complete requirements to activate"}
                    </p>
                </div>
                <Switch 
                    id="active-mode"
                    checked={formData.active}
                    disabled={(!isReady && !isAdmin)} // Disabled if not ready (unless admin)
                    onCheckedChange={checked => setFormData({...formData, active: checked})}
                />
            </div>
        </div>

        {/* Right Side: Photos & Checklist */}
        <div className="w-full md:w-80 space-y-6">
             {/* Publish Checklist */}
             <Card className={`p-4 border-l-4 ${isReady ? 'border-l-green-500 bg-green-50/30' : 'border-l-amber-500 bg-amber-50/30'}`}>
                <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    {isReady ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <AlertCircle className="w-4 h-4 text-amber-600"/>}
                    Publish Checklist
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        {checklist.driverVerified ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <Circle className="w-4 h-4 text-gray-400"/>}
                        <span className={checklist.driverVerified ? "text-gray-900" : "text-gray-500"}>Driver Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {checklist.mainPhoto ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <Circle className="w-4 h-4 text-gray-400"/>}
                        <span className={checklist.mainPhoto ? "text-gray-900" : "text-gray-500"}>Main Photo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {checklist.galleryPhotos ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <Circle className="w-4 h-4 text-gray-400"/>}
                        <span className={checklist.galleryPhotos ? "text-gray-900" : "text-gray-500"}>Gallery (3+ Photos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {checklist.pricing ? <CheckCircle2 className="w-4 h-4 text-green-600"/> : <Circle className="w-4 h-4 text-gray-400"/>}
                        <span className={checklist.pricing ? "text-gray-900" : "text-gray-500"}>Pricing Configured</span>
                    </div>
                </div>
                {!isReady && (
                    <div className="mt-3 text-xs bg-white p-2 rounded border border-amber-200 text-amber-800">
                        Complete all items to publish your car automatically.
                    </div>
                )}
             </Card>

             {/* Main Photo */}
             <div>
                <Label>Main Photo <span className="text-red-500">*</span></Label>
                {formData.main_photo ? (
                    <div className="relative w-full h-40 mt-1 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={formData.main_photo} alt="Main" className="w-full h-full object-cover" />
                        <button onClick={() => setFormData({...formData, main_photo: ''})} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="mt-1">
                        <PhotoUpload 
                            bucketName="car-photos" 
                            pathPrefix={`car-${formData.driver_id || 'temp'}/main`} 
                            onUploadComplete={url => setFormData({...formData, main_photo: url})}
                        />
                    </div>
                )}
            </div>

            {/* Gallery */}
            <div>
                <Label className="flex justify-between items-center mb-1">
                    <span>Gallery Photos <span className="text-red-500">*</span></span>
                    <span className={`text-xs px-2 py-0.5 rounded ${formData.gallery_images.length >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {formData.gallery_images.length}/5 (Min 3)
                    </span>
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                    {formData.gallery_images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-gray-100 group border border-gray-200">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeGalleryPhoto(i)} 
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {formData.gallery_images.length < 5 && (
                        <PhotoUpload 
                            bucketName="car-photos" 
                            pathPrefix={`car-${formData.driver_id || 'temp'}/gallery`} 
                            multiple
                            compact
                            className="aspect-square h-auto"
                            onUploadComplete={urls => {
                                const newUrls = Array.isArray(urls) ? urls : [urls];
                                setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, ...newUrls].slice(0, 5) }));
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="pt-4 space-y-2">
                <Button onClick={handleSubmit} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} 
                    Save Car
                </Button>
                <Button variant="outline" onClick={onCancel} type="button" className="w-full">Cancel</Button>
            </div>
        </div>
    </div>
  );
};

export default CarForm;