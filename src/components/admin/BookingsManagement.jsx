import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BookingsManagement = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        start_location:locations!bookings_start_location_id_fkey(name_en),
        end_location:locations!bookings_end_location_id_fkey(name_en),
        drivers(first_name, last_name),
        cars(make, model)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setLoading(false);
      return;
    }
    
    setBookings(data || []);
    setLoading(false);
  };
  
  const updateBookingStatus = async (bookingId, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      return;
    }
    
    toast({
      title: 'Success',
      description: `Booking status updated to ${status}`,
    });
    
    fetchBookings();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold">{booking.customer_first_name}</p>
              <p className="text-sm text-gray-600">{booking.customer_phone}</p>
              <p className="text-sm text-gray-600">{booking.customer_email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Route</p>
              <p className="font-semibold">
                {booking.start_location?.name_en} → {booking.end_location?.name_en}
              </p>
              <p className="text-sm text-gray-600">
                {booking.date} at {booking.time}
              </p>
              <p className="text-sm text-gray-600">
                Distance: {booking.distance_km?.toFixed(1)} km
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Driver & Car</p>
              {booking.drivers ? (
                <>
                  <p className="font-semibold">
                    {booking.drivers.first_name} {booking.drivers.last_name}
                  </p>
                  {booking.cars && (
                    <p className="text-sm text-gray-600">
                      {booking.cars.make} {booking.cars.model}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600">Not assigned</p>
              )}
              <p className="text-lg font-bold text-green-600 mt-2">
                ₾{booking.total_price}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <Select
                value={booking.status}
                onValueChange={(value) => updateBookingStatus(booking.id, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {booking.customer_comment && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Comment:</p>
              <p className="text-sm">{booking.customer_comment}</p>
            </div>
          )}
        </Card>
      ))}
      
      {bookings.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No bookings yet
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;