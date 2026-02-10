import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const DriverEarnings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      total: 0,
      thisMonth: 0,
      pending: 0,
      tripCount: 0
  });
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if(user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    // Get driver ID
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', user.id).single();
    if(!driver) return;

    // Fetch bookings/earnings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', driver.id)
        .not('driver_earnings', 'is', null)
        .order('created_at', { ascending: false });

    if(bookings) {
        let total = 0;
        let pending = 0;
        let month = 0;
        const currentMonth = new Date().getMonth();
        
        bookings.forEach(b => {
            const earnings = Number(b.driver_earnings || 0);
            total += earnings;
            if(b.payment_status === 'pending') pending += earnings;
            if(new Date(b.created_at).getMonth() === currentMonth) month += earnings;
        });

        setStats({
            total,
            thisMonth: month,
            pending,
            tripCount: bookings.length
        });
        setTrips(bookings);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold">My Earnings</h1>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-6 bg-green-600 text-white">
               <p className="text-green-100 mb-1">Total Earned</p>
               <h3 className="text-3xl font-bold">₾{stats.total.toLocaleString()}</h3>
           </Card>
           <Card className="p-6">
               <p className="text-gray-500 mb-1">This Month</p>
               <h3 className="text-3xl font-bold text-gray-900">₾{stats.thisMonth.toLocaleString()}</h3>
           </Card>
           <Card className="p-6">
               <p className="text-gray-500 mb-1">Pending Payout</p>
               <h3 className="text-3xl font-bold text-yellow-600">₾{stats.pending.toLocaleString()}</h3>
           </Card>
       </div>

       <Card className="border-none shadow-sm overflow-hidden">
           <div className="p-4 border-b">
               <h3 className="font-bold">Recent Trips History</h3>
           </div>
           <Table>
               <TableHeader>
                   <TableRow>
                       <TableHead>Date</TableHead>
                       <TableHead>Route</TableHead>
                       <TableHead>Distance</TableHead>
                       <TableHead>Your Earnings</TableHead>
                       <TableHead>Status</TableHead>
                   </TableRow>
               </TableHeader>
               <TableBody>
                   {loading ? (
                       <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                   ) : trips.length === 0 ? (
                       <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No earnings history yet.</TableCell></TableRow>
                   ) : (
                       trips.map(trip => (
                           <TableRow key={trip.id}>
                               <TableCell>{format(new Date(trip.created_at), 'MMM d, yyyy')}</TableCell>
                               <TableCell className="max-w-[200px] truncate">{trip.from_location} → {trip.to_location}</TableCell>
                               <TableCell>{trip.distance_km} km</TableCell>
                               <TableCell className="font-bold text-green-600">₾{trip.driver_earnings}</TableCell>
                               <TableCell>
                                   <Badge variant={trip.payment_status === 'completed' ? 'default' : 'secondary'}>
                                       {trip.payment_status}
                                   </Badge>
                               </TableCell>
                           </TableRow>
                       ))
                   )}
               </TableBody>
           </Table>
       </Card>
    </div>
  );
};

export default DriverEarnings;