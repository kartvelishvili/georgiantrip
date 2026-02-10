import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Search, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        driver:drivers(first_name, last_name),
        car:cars(make, model)
      `)
      .order('created_at', { ascending: false });
    
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const filteredBookings = bookings.filter(b => 
    b.customer_phone?.includes(searchTerm) ||
    b.driver?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>

       <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
             <Input 
                placeholder="Search by passenger phone or driver..." 
                className="pl-10 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2"/> Filter Status</Button>
       </div>

       <Card className="border-none shadow-sm overflow-hidden">
          <Table>
             <TableHeader className="bg-gray-50">
                <TableRow>
                   <TableHead>ID</TableHead>
                   <TableHead>Route</TableHead>
                   <TableHead>Date</TableHead>
                   <TableHead>Driver</TableHead>
                   <TableHead>Price</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Action</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={7} className="text-center py-8">Loading bookings...</TableCell></TableRow>
                ) : filteredBookings.length === 0 ? (
                   <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No bookings found</TableCell></TableRow>
                ) : (
                   filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                         <TableCell className="font-mono text-xs">{booking.id.slice(0,8)}...</TableCell>
                         <TableCell>
                            <div className="text-sm max-w-[200px] truncate" title={`${booking.from_location} -> ${booking.to_location}`}>
                               {booking.from_location?.split(',')[0]} → {booking.to_location?.split(',')[0]}
                            </div>
                         </TableCell>
                         <TableCell>{booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                         <TableCell>{booking.driver ? `${booking.driver.first_name} ${booking.driver.last_name}` : <span className="text-gray-400">Unassigned</span>}</TableCell>
                         <TableCell>₾{booking.passenger_price || booking.total_price}</TableCell>
                         <TableCell>
                            <Badge className={
                               booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                               booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                               'bg-yellow-100 text-yellow-700'
                            }>{booking.status}</Badge>
                         </TableCell>
                         <TableCell className="text-right">
                             <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
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

export default AdminBookings;