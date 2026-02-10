import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, User, Check, CreditCard, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { createTransferBooking } from '@/lib/bookingService';
import { supabase } from '@/lib/customSupabaseClient';
import { calculateDriverIncome } from '@/lib/pricing';

const BookingConfirmation = ({ data, car, searchParams, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [adminCommissionPercent, setAdminCommissionPercent] = useState(30); // Default 30%

  useEffect(() => {
    const fetchCommission = async () => {
      const { data: settings } = await supabase.from('admin_settings').select('default_admin_commission').maybeSingle();
      if (settings?.default_admin_commission) {
        setAdminCommissionPercent(Number(settings.default_admin_commission));
      }
    };
    fetchCommission();
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const driverPercent = 100 - adminCommissionPercent;
      const { driverEarnings, adminCommission } = calculateDriverIncome(car.price, driverPercent);
      const bookingPayload = {
        // Customer Info
        customer_first_name: data.passengerName, // Using first_name to store full name as requested
        customer_phone: data.passengerPhone,
        customer_email: data.passengerEmail,
        customer_comment: data.specialRequests,
        
        // Trip Info
        start_location_id: searchParams.startLocation?.id,
        end_location_id: searchParams.endLocation?.id,
        stops: searchParams.stops?.map(s => s?.id).filter(Boolean) || [],
        
        // Coordinates snapshot
        pickup_lat: searchParams.startLocation?.lat,
        pickup_lng: searchParams.startLocation?.lng,
        dropoff_lat: searchParams.endLocation?.lat,
        dropoff_lng: searchParams.endLocation?.lng,
        
        // Relations
        driver_id: car.driver?.id || car.driver_id,
        car_id: car.id,
        
        // Financials — dynamic commission from admin_settings
        total_price: car.price,
        passenger_price: car.price,
        driver_earnings: driverEarnings,
        admin_commission: adminCommission,
        
        // Meta
        distance_km: searchParams.distance,
        duration_minutes: searchParams.duration ? (typeof searchParams.duration === 'string' ? parseInt(searchParams.duration) : searchParams.duration) : 0,
        passenger_count: data.passengerCount,
        date: searchParams.date,
        time: searchParams.time || '12:00', // Default to 12:00 if not provided to satisfy NOT NULL constraint
        payment_method: data.paymentMethod,
        
        // Location IDs
        pickup_location_id: searchParams.startLocation?.id,
        dropoff_location_id: searchParams.endLocation?.id,
      };

      const result = await createTransferBooking(bookingPayload);
      onSuccess(result);

    } catch (error) {
      console.error("Booking creation error:", error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const PaymentIcon = {
    card: CreditCard,
    cash: Banknote,
    wallet: Wallet
  }[data.paymentMethod] || Banknote;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Trip Summary</h3>
        
        <div className="space-y-3">
          <div className="flex gap-3">
             <MapPin className="w-5 h-5 text-green-600 shrink-0" />
             <div>
               <p className="text-xs text-gray-500 uppercase font-bold">From</p>
               <p className="text-sm font-medium">{searchParams.startLocation?.name}</p>
             </div>
          </div>
          <div className="flex gap-3">
             <MapPin className="w-5 h-5 text-red-500 shrink-0" />
             <div>
               <p className="text-xs text-gray-500 uppercase font-bold">To</p>
               <p className="text-sm font-medium">{searchParams.endLocation?.name}</p>
             </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm">
           <span className="text-gray-500">Date</span>
           <span className="font-medium">{searchParams.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
           <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs uppercase font-bold">
              <User className="w-4 h-4" /> Passenger
           </div>
           <p className="font-bold text-sm truncate">{data.passengerName}</p>
           <p className="text-xs text-gray-500 truncate">{data.passengerPhone}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
           <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs uppercase font-bold">
              <PaymentIcon className="w-4 h-4" /> Payment
           </div>
           <p className="font-bold text-sm capitalize">{data.paymentMethod}</p>
           <p className="text-xs text-green-600 font-bold">{formatCurrency(car.price)}</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3 items-start">
         <div className="bg-yellow-100 p-1 rounded-full text-yellow-700 shrink-0 mt-0.5">
           <Check className="w-3 h-3" />
         </div>
         <p className="text-xs text-yellow-800 leading-relaxed">
           By clicking Confirm, you agree to our Terms of Service. Your driver will be notified immediately.
         </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={loading} className="w-1/3 h-14 border-gray-200 text-base">
          Back
        </Button>
        <Button 
          className="w-2/3 h-14 bg-green-600 hover:bg-green-700 font-bold text-base shadow-lg shadow-green-100" 
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
             <>
               <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
             </>
          ) : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;