import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Car, MapPin, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const BookingForm = ({ car, searchData, distance, onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    email: '',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  if (!searchData) {
    return <div>Error: Missing search data</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Prepare booking payload
      const bookingPayload = {
        customer_first_name: formData.firstName,
        customer_phone: formData.phone,
        customer_email: formData.email,
        customer_comment: formData.comment,
        
        // Location Relations
        start_location_id: searchData.startLocation?.id,
        end_location_id: searchData.endLocation?.id,
        stops: searchData.stops?.map(s => s?.id).filter(Boolean) || [],

        // Coordinate Snapshots
        pickup_lat: searchData.startLocation?.lat,
        pickup_lng: searchData.startLocation?.lng,
        dropoff_lat: searchData.endLocation?.lat,
        dropoff_lng: searchData.endLocation?.lng,
        stops_coords: searchData.stops?.filter(Boolean).map(s => ({ lat: s.lat, lng: s.lng })),

        date: searchData.date,
        time: '12:00', // Default if not selected, or add time picker back if needed
        
        driver_id: car.drivers?.id,
        car_id: car.id,
        
        total_price: car.calculatedPrice,
        passenger_price: car.calculatedPrice, // Store visible price
        distance_km: distance,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Booking Request Sent!',
        description: 'The driver will confirm your request shortly.',
      });
      
      setFormData({ firstName: '', phone: '', email: '', comment: '' });
      
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
      
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Booking failed',
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-gray-100 -ml-4 text-gray-600">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to results
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card className="p-8 border-gray-100 shadow-xl rounded-2xl">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">1</span>
              Contact Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 font-bold mb-2">{t('firstName')} *</Label>
                  <Input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Enter your name" className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500" />
                </div>
                <div>
                  <Label className="text-gray-700 font-bold mb-2">{t('phone')} *</Label>
                  <Input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+995 ..." className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500" />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-700 font-bold mb-2">{t('email')} *</Label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500" />
              </div>
              
              <div>
                <Label className="text-gray-700 font-bold mb-2">{t('comment')} (Optional)</Label>
                <Textarea value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} placeholder="Flight number, extra luggage, child seat..." rows={4} className="bg-gray-50 border-gray-200 rounded-xl focus:ring-green-500" />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                <div className="w-1.5 h-full bg-yellow-400 rounded-full"></div>
                <div>
                  <p className="font-bold text-yellow-900 mb-1">Payment Method</p>
                  <p className="text-sm text-yellow-800">You will pay the driver directly in cash (GEL, USD, or EUR) upon arrival.</p>
                </div>
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl font-bold shadow-lg shadow-green-600/20">
                {submitting ? 'Processing...' : `Confirm Booking • ₾${car.calculatedPrice?.toFixed(0)}`}
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 border-gray-100 shadow-lg rounded-2xl sticky top-24 bg-gray-50/50 backdrop-blur-sm">
             <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">Trip Summary</h3>
             
             <div className="space-y-4 mb-6 relative">
                <div className="absolute left-[11px] top-8 bottom-4 w-0.5 bg-gray-300"></div>
                <div className="flex gap-3 relative z-10">
                   <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 shrink-0"></div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Pick-up</p>
                      <p className="font-medium text-gray-900">{searchData.startLocation?.name}</p>
                   </div>
                </div>
                <div className="flex gap-3 relative z-10">
                   <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 shrink-0"></div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Drop-off</p>
                      <p className="font-medium text-gray-900">{searchData.endLocation?.name}</p>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                   <Calendar className="w-4 h-4" />
                   <span>{searchData.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                   <MapPin className="w-4 h-4" />
                   <span>{distance?.toFixed(0)} km approx.</span>
                </div>
             </div>

             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                   <img src={car.photos_urls?.[0]} className="w-full h-full object-cover" alt="Car" />
                </div>
                <div>
                   <p className="font-bold text-gray-900">{car.make} {car.model}</p>
                   <p className="text-xs text-gray-500">Driver: {car.drivers?.first_name}</p>
                </div>
             </div>

             <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                <span className="text-gray-500 font-medium">Total</span>
                <span className="text-3xl font-bold text-green-600">₾{car.calculatedPrice?.toFixed(0)}</span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;