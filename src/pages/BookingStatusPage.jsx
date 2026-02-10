import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '@/lib/bookingService';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Phone, MessageSquare, MapPin, Share2, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const BookingStatusPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load booking details'
        });
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (error) throw error;
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
      toast({ title: 'Booking Cancelled', description: 'Your booking has been cancelled.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not cancel booking' });
    } finally {
      setCancelling(false);
    }
  };

  const handleShareBooking = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Booking #${bookingId.slice(0, 8)}`, url });
      } catch { /* user dismissed share dialog */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied', description: 'Booking link copied to clipboard.' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-green-600" /></div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center">Booking not found</div>;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24">
      <Helmet>
        <title>Booking #{bookingId.slice(0, 8)} - GeorgianTrip</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4">
        <Button variant="ghost" className="mb-4 -ml-2 text-gray-600 hover:text-gray-900" onClick={() => navigate('/search-results')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <Badge className={`${statusColors[booking.status] || 'bg-gray-100'} border-0 px-3 py-1 capitalize`}>
            {booking.status}
          </Badge>
        </div>

        {/* Alert for Pending */}
        {booking.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
             <div className="p-2 bg-blue-100 rounded-full text-blue-600 shrink-0 h-fit">
                <Loader2 className="w-5 h-5 animate-spin" />
             </div>
             <div>
                <h3 className="font-bold text-blue-900 text-sm mb-1">Waiting for driver confirmation</h3>
                <p className="text-sm text-blue-700">The driver usually confirms within 5 minutes. We will notify you via SMS/Email.</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
             {/* Map / Location Card */}
             <Card className="p-0 overflow-hidden border-gray-100 shadow-sm rounded-2xl">
                <div className="bg-slate-100 h-40 flex items-center justify-center text-gray-400">
                   {/* Placeholder for real map */}
                   <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Interactive Map Placeholder</span>
                </div>
                <div className="p-5 space-y-6">
                   <div className="flex gap-4 relative">
                      <div className="flex flex-col items-center pt-1">
                         <div className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-50"></div>
                         <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                         <div className="w-3 h-3 bg-red-500 rounded-full ring-4 ring-red-50"></div>
                      </div>
                      <div className="flex-1 space-y-6">
                         <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pick Up</p>
                            <p className="font-bold text-gray-900">{booking.pickup_location?.name_en || 'Unknown Location'}</p>
                            <p className="text-sm text-gray-500">{booking.date || 'N/A'} • {booking.time || 'N/A'}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Drop Off</p>
                            <p className="font-bold text-gray-900">{booking.dropoff_location?.name_en || 'Unknown Location'}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </Card>

             {/* Driver Info */}
             <Card className="p-5 border-gray-100 shadow-sm rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4">Driver Details</h3>
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden">
                      <img src={booking.driver?.avatar_url || "https://placehold.co/100"} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-lg">{booking.driver?.first_name} {booking.driver?.last_name}</h4>
                      <p className="text-sm text-gray-500">{booking.car?.make} {booking.car?.model} • {booking.car?.license_plate}</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-full">
                         <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                         <Phone className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
             </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <Card className="p-5 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50">
                <h3 className="font-bold text-gray-900 mb-4">Payment Breakdown</h3>
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between text-gray-600">
                      <span>Base Fare</span>
                      <span>{formatCurrency(booking.total_price)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Discount</span>
                      <span>-</span>
                   </div>
                   <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(booking.total_price)}</span>
                   </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span className="capitalize">Method: {booking.payment_method}</span>
                   </div>
                </div>
             </Card>

             <div className="space-y-3">
                <Button 
                   variant="outline" 
                   className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                   onClick={handleCancelBooking}
                   disabled={cancelling || booking.status === 'cancelled' || booking.status === 'completed'}
                >
                   {cancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                   {booking.status === 'cancelled' ? 'Booking Cancelled' : 'Cancel Booking'}
                </Button>
                <Button variant="ghost" className="w-full text-gray-500" onClick={handleShareBooking}>
                   <Share2 className="w-4 h-4 mr-2" /> Share Booking
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatusPage;