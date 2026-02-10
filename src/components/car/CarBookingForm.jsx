import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Users, MapPin, Check, Loader2, ArrowRight } from 'lucide-react';
import { createTransferBooking } from '@/lib/bookingService';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const CarBookingForm = ({ car, transfer, initialDate, initialTravelers }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminCommission, setAdminCommission] = useState(30);
  
  // Fetch commission from admin_settings
  useEffect(() => {
    supabase.from('admin_settings').select('default_admin_commission').maybeSingle()
      .then(({ data }) => { if (data?.default_admin_commission) setAdminCommission(Number(data.default_admin_commission)); });
  }, []);
  
  // Default values
  const [formData, setFormData] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    travelers: initialTravelers || 1,
    fullName: '',
    email: '',
    phone: '',
    requests: ''
  });

  const [pricing, setPricing] = useState({
    pricePerKm: 0,
    distance: 0,
    subtotal: 0,
    total: 0
  });

  // Calculate price dynamically based on Travelers * Distance * PricePerKm
  useEffect(() => {
    // 1. Get Base Variables
    const pricePerKm = parseFloat(car?.price_per_km || 2);
    const distance = parseFloat(transfer?.distance_km || 0);
    const travelers = parseInt(formData.travelers || 1);
    
    // 2. Calculate
    // Formula: Total = Distance * PricePerKm (per-vehicle, not per-passenger)
    const subtotal = distance * pricePerKm;
    const total = subtotal;

    setPricing({
      pricePerKm,
      distance,
      subtotal,
      total
    });

  }, [car, transfer, formData.travelers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Booking Object
      const bookingPayload = {
        customer_first_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email,
        customer_comment: formData.requests,
        
        car_id: car.id,
        driver_id: car.driver_id,
        
        // Use transfer locations if available
        pickup_location_id: transfer?.from_location_id,
        dropoff_location_id: transfer?.to_location_id,
        
        // Store explicit lat/lng
        pickup_lat: transfer?.from_location?.lat,
        pickup_lng: transfer?.from_location?.lng,
        dropoff_lat: transfer?.to_location?.lat,
        dropoff_lng: transfer?.to_location?.lng,

        date: formData.date,
        time: '10:00', // Default time
        passenger_count: parseInt(formData.travelers),
        
        // Financials
        total_price: pricing.total,
        passenger_price: pricing.total,
        driver_earnings: pricing.total * (100 - adminCommission) / 100,
        admin_commission: pricing.total * adminCommission / 100,
        
        distance_km: pricing.distance,
        duration_minutes: transfer?.duration_minutes || 0,
        status: 'pending',
        payment_method: 'card',
        payment_status: 'pending'
      };

      const result = await createTransferBooking(bookingPayload);
      
      if (result && result.success) {
         // Immediate redirect
         toast({
            title: "Booking Initiated",
            description: "Redirecting to confirmation...",
            className: "bg-green-50 border-green-200 text-green-800"
         });
         navigate(`/booking-confirmation/${result.id}`); 
      } else {
         throw new Error('Booking creation failed');
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Please check your inputs and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden sticky top-24">
      {/* Form Header */}
      <div className="bg-gray-900 p-6 text-white">
        <h3 className="text-xl font-bold font-heading mb-1">Book Your Transfer</h3>
        <p className="text-gray-400 text-sm">Instant confirmation • Secure payment</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        
        {/* Route Info Display */}
        {transfer && (
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between text-sm">
              <div>
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Route</p>
                 <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="truncate max-w-[80px]">{transfer.from_location?.name_en}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="truncate max-w-[80px]">{transfer.to_location?.name_en}</span>
                 </div>
              </div>
              <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Distance</p>
                  <p className="font-bold text-gray-900">{pricing.distance} km</p>
              </div>
           </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
               <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
               <Input 
                 type="date" 
                 id="date" 
                 name="date"
                 value={formData.date}
                 onChange={handleChange}
                 required
                 className="pl-9"
               />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelers">Travelers</Label>
            <div className="relative">
               <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
               <Input 
                 type="number" 
                 id="travelers" 
                 name="travelers"
                 min="1"
                 max={car.seats}
                 value={formData.travelers}
                 onChange={handleChange}
                 required
                 className="pl-9"
               />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
             id="fullName" 
             name="fullName"
             placeholder="John Doe"
             value={formData.fullName}
             onChange={handleChange}
             required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
             type="email"
             id="email" 
             name="email"
             placeholder="john@example.com"
             value={formData.email}
             onChange={handleChange}
             required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
             type="tel"
             id="phone" 
             name="phone"
             placeholder="+995 555 000 000"
             value={formData.phone}
             onChange={handleChange}
             required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requests">Special Requests <span className="text-gray-400 font-normal">(Optional)</span></Label>
          <Textarea 
             id="requests"
             name="requests"
             placeholder="Child seat, extra luggage, etc."
             value={formData.requests}
             onChange={handleChange}
             className="h-20"
          />
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-100 pt-4 mt-2 bg-gray-50 -mx-6 px-6 pb-4 -mb-6">
           <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs text-gray-500">
                  <span>Rate per km</span>
                  <span>{formatCurrency(pricing.pricePerKm)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                  <span>Distance</span>
                  <span>{pricing.distance} km</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Trip Price (per vehicle)</span>
                  <span>{formatCurrency(pricing.subtotal)}</span>
              </div>
           </div>
           
           <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total Price</span>
              <div className="text-right">
                 <span className="text-2xl font-bold text-green-600 block leading-none">{formatCurrency(pricing.total)}</span>
                 <span className="text-[10px] text-gray-400 font-normal">Taxes included</span>
              </div>
           </div>
           
           <Button 
            type="submit" 
            disabled={loading || pricing.total === 0}
            className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 transition-all hover:scale-[1.02] mt-4"
          >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Book Now"}
          </Button>

          <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1 mt-3">
             <Check className="w-3 h-3" /> Secure SSL Payment
          </p>
        </div>
      </form>
    </div>
  );
};

export default CarBookingForm;