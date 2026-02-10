import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import BookingModal from '@/components/driver/BookingModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const DriverBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Rejection/Cancellation Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'reject' or 'cancel'
  const [targetBookingId, setTargetBookingId] = useState(null);

  useEffect(() => {
    if (user) {
        fetchBookings();
        // Realtime updates
        const sub = supabase.channel('bookings_updates')
           .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
           .subscribe();
        return () => sub.unsubscribe();
    }
  }, [user, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
        // Use maybeSingle() to avoid PGRST116 error if driver profile doesn't exist yet
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (driverError) {
            console.error("Error fetching driver profile:", driverError);
            setLoading(false);
            return;
        }

        if (!driver) {
            // User is logged in but not a driver yet, or profile not created
            setLoading(false);
            return;
        }

        let query = supabase
            .from('bookings')
            .select(`
              *,
              pickup_location:locations!bookings_pickup_location_id_fkey(name_en),
              dropoff_location:locations!bookings_dropoff_location_id_fkey(name_en)
            `)
            .eq('driver_id', driver.id)
            .order('created_at', { ascending: false });
        
        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data, error: bookingsError } = await query;
        
        if (bookingsError) {
            throw bookingsError;
        }
        
        setBookings(data || []);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load bookings.' });
    } finally {
        setLoading(false);
    }
  };

  const handleOpenActionModal = (id, type) => {
      setTargetBookingId(id);
      setActionType(type);
      setReason('');
      setRejectModalOpen(true);
  };

  const submitReason = async () => {
      if (!reason) {
          toast({ variant: 'destructive', title: 'Reason Required', description: 'Please explain why.' });
          return;
      }
      
      const status = actionType === 'reject' ? 'rejected' : 'cancelled';
      const { error } = await supabase.from('bookings')
        .update({ status: status, rejection_reason: reason })
        .eq('id', targetBookingId);
      
      if (!error) {
          toast({ title: 'Success', description: `Booking ${status}` });
          setRejectModalOpen(false);
          setSelectedBooking(null);
          fetchBookings();
      } else {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  };

  const handleStatusUpdate = async (id, newStatus) => {
      if (newStatus === 'rejected' || newStatus === 'cancelled') {
          handleOpenActionModal(id, newStatus === 'rejected' ? 'reject' : 'cancel');
          return;
      }

      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
          toast({ title: 'Success', description: `Booking ${newStatus}` });
          fetchBookings();
          setSelectedBooking(null);
      }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'confirmed': return 'bg-blue-100 text-blue-800';
          case 'completed': return 'bg-green-100 text-green-800';
          case 'cancelled': return 'bg-gray-100 text-gray-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100';
      }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">History</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        {bookings.length === 0 ? (
            <Card className="p-16 flex flex-col items-center justify-center text-center text-gray-500 border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">📅</div>
                <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
                <p>New bookings will appear here instantly.</p>
            </Card>
        ) : (
            <div className="grid gap-4">
                {bookings.map(booking => (
                    <Card key={booking.id} className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className={`shadow-none border-0 ${getStatusColor(booking.status)}`}>{booking.status}</Badge>
                                <span className="text-xs text-gray-400">ID: {booking.id.slice(0,8)}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">
                                {booking.pickup_location?.name_en || 'Unknown'} → {booking.dropoff_location?.name_en || 'Destination'}
                            </h3>
                            <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-4">
                                <span className="flex items-center gap-1">👤 {booking.customer_first_name}</span>
                                <span className="flex items-center gap-1">🕒 {new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
                                <span>📏 {booking.distance_km} km</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-0 pt-4 md:pt-0">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Your Net</p>
                                <p className="text-xl font-bold text-green-600">₾{booking.driver_earnings || (booking.total_price * 0.7).toFixed(0)}</p>
                            </div>
                            <Button variant="outline" onClick={() => setSelectedBooking(booking)}>View</Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}

        <BookingModal 
            booking={selectedBooking} 
            isOpen={!!selectedBooking} 
            onClose={() => setSelectedBooking(null)}
            onUpdateStatus={handleStatusUpdate}
        />

        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{actionType === 'reject' ? 'Reject Booking' : 'Cancel Trip'}</DialogTitle>
                    <DialogDescription>Please provide a reason. This will be visible to the customer.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Label>Reason</Label>
                    <Textarea 
                        value={reason} 
                        onChange={e => setReason(e.target.value)} 
                        placeholder={actionType === 'reject' ? "I am not available..." : "Car breakdown..."} 
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>Back</Button>
                    <Button variant="destructive" onClick={submitReason}>{actionType === 'reject' ? 'Reject' : 'Cancel'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default DriverBookings;