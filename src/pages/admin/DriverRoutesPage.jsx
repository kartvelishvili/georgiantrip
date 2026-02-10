
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Calendar, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const DriverRoutesPage = () => {
  const { id: driverId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverRoutes();
  }, [driverId]);

  const fetchDriverRoutes = async () => {
    setLoading(true);
    try {
      // Fetch driver name
      const { data: driver } = await supabase.from('drivers').select('first_name, last_name').eq('id', driverId).single();
      if (driver) setDriverName(`${driver.first_name} ${driver.last_name}`);

      // Fetch bookings with location details
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pickup_location:locations!pickup_location_id(name_en),
          dropoff_location:locations!dropoff_location_id(name_en)
        `)
        .eq('driver_id', driverId)
        .order('date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRoute = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this route?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', notes: 'Cancelled by Admin' })
        .eq('id', bookingId);
      
      if (error) throw error;
      toast({ title: 'Route cancelled' });
      fetchDriverRoutes();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/paneli/drivers')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
           Routes History: {driverName}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Booked Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-8">Loading routes...</TableCell>
                   </TableRow>
                ) : bookings.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-8 text-gray-500">No routes found for this driver.</TableCell>
                   </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(booking.date), 'MMM dd, yyyy')}
                         </div>
                         <div className="text-xs text-gray-500 ml-6">{booking.time}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.pickup_location?.name_en || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">to</div>
                        <div className="font-medium">{booking.dropoff_location?.name_en || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>{booking.passenger_count || 1}</TableCell>
                      <TableCell>
                         <Badge variant={booking.status === 'completed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}>
                           {booking.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₾{booking.driver_earnings || 0}
                      </TableCell>
                      <TableCell className="text-right">
                         {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelRoute(booking.id)}>
                               <Ban className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                         )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverRoutesPage;
