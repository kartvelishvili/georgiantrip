import React, { useEffect, useState } from 'react';
import { getAllTourBookings } from '@/lib/bookingService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Eye, Calendar, User } from 'lucide-react';
import { formatPriceDetail } from '@/lib/currencyUtils';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Using the specific function for tour bookings
        const data = await getAllTourBookings();
        setBookings(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                    </TableCell>
                </TableRow>
            ) : bookings.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">No bookings found.</TableCell>
                </TableRow>
            ) : (
                bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs text-gray-500">{booking.id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{booking.tours?.name_en || 'Unknown Tour'}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{booking.passenger_name}</span>
                                <span className="text-xs text-gray-400">{booking.passenger_email}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {new Date(booking.tour_date).toLocaleDateString()}
                            </div>
                        </TableCell>
                        <TableCell>{formatPriceDetail(booking.total_price_gel)}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                booking.payment_status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {booking.payment_status || 'Pending'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;