import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Eye, CreditCard, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';

const TourBookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalPassengers: 0,
    paidBookings: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tour_bookings')
        .select(`
          *,
          tour:tours(name_en, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const list = data || [];
      setBookings(list);
      
      // Calculate stats
      const totalRevenue = list
        .filter(b => b.payment_status === 'completed')
        .reduce((sum, b) => sum + (Number(b.total_price_gel) || Number(b.total_price) || 0), 0);
      const totalPassengers = list.reduce((sum, b) => sum + (Number(b.passenger_count) || 1), 0);
      const paidBookings = list.filter(b => b.payment_status === 'completed').length;
      const pendingPayments = list.filter(b => b.payment_status === 'pending').length;
      
      setStats({
        totalBookings: list.length,
        totalRevenue,
        totalPassengers,
        paidBookings,
        pendingPayments,
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tour_bookings')
        .update({ booking_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      if (error) throw error;
      toast({ title: 'Status Updated', description: `Booking marked as ${newStatus}` });
      fetchBookings();
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, booking_status: newStatus }));
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchSearch = !searchQuery || 
      (b.passenger_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.passenger_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.passenger_phone || '').includes(searchQuery) ||
      (b.tour_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.paypal_transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.booking_status === statusFilter;
    const matchPayment = paymentFilter === 'all' || b.payment_status === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Paid</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Failed</Badge>;
      case 'refunded': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Refunded</Badge>;
      default: return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Confirmed</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Cancelled</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Pending</Badge>;
      default: return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const openDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Tour Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tour reservations, passenger data & payments</p>
        </div>
        <Button variant="outline" onClick={fetchBookings} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">₾{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPassengers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paidBookings}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg"><CreditCard className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Pay</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name, email, phone, tour or transaction ID..." 
              className="pl-10" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Booking Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Payment Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="completed">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Passenger</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                        ? 'No bookings match your filters.'
                        : 'No tour bookings yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(booking)}>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900">{booking.passenger_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{booking.passenger_email}</div>
                          <div className="text-xs text-gray-400">{booking.passenger_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate font-medium text-gray-700">
                          {booking.tour_name || booking.tour?.name_en || 'Unknown Tour'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {booking.tour_date ? new Date(booking.tour_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-3 h-3 text-gray-400" />
                          {booking.passenger_count || 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-bold text-green-700">₾{booking.total_price_gel || booking.total_price || 0}</div>
                          {booking.total_price_usd && (
                            <div className="text-xs text-gray-400">${booking.total_price_usd} USD</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getPaymentBadge(booking.payment_status)}
                          {booking.payment_method === 'cash' && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-[10px]">Cash</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(booking)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Tour Booking Details</DialogTitle>
            <DialogDescription>Full booking, passenger and payment information</DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 pt-2">
              {/* Passenger Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" /> Passenger Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Full Name</span>
                    <span className="font-semibold text-gray-900">{selectedBooking.passenger_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Email</span>
                    <span className="text-gray-900">{selectedBooking.passenger_email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Phone</span>
                    <span className="text-gray-900">{selectedBooking.passenger_phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Number of Travelers</span>
                    <span className="font-semibold text-gray-900">{selectedBooking.passenger_count || 1}</span>
                  </div>
                </div>
                {selectedBooking.special_requests && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Special Requests</span>
                    <p className="text-sm text-gray-700 italic">{selectedBooking.special_requests}</p>
                  </div>
                )}
              </div>

              {/* Tour Info */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Tour Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Tour</span>
                    <span className="font-semibold text-gray-900">{selectedBooking.tour_name || selectedBooking.tour?.name_en || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Tour Date</span>
                    <span className="text-gray-900">
                      {selectedBooking.tour_date
                        ? new Date(selectedBooking.tour_date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Booking Status</span>
                    {getStatusBadge(selectedBooking.booking_status)}
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Booked On</span>
                    <span className="text-gray-900">
                      {selectedBooking.created_at
                        ? new Date(selectedBooking.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" /> Financial Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Total Price (GEL)</span>
                    <span className="text-xl font-bold text-green-700">₾{selectedBooking.total_price_gel || selectedBooking.total_price || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Total Price (USD)</span>
                    <span className="text-xl font-bold text-gray-700">${selectedBooking.total_price_usd || '—'}</span>
                  </div>
                  {selectedBooking.discount_percent > 0 && (
                    <div>
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Discount Applied</span>
                      <span className="text-green-600 font-bold">{selectedBooking.discount_percent}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" /> 
                  {selectedBooking.payment_method === 'cash' ? 'Cash Payment' : 'PayPal Payment'}
                </h3>
                {selectedBooking.payment_method === 'cash' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 font-medium">
                    Customer will pay in cash on the tour day
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Payment Status</span>
                    {getPaymentBadge(selectedBooking.payment_status)}
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs font-medium mb-0.5">Transaction ID</span>
                    <span className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded border">
                      {selectedBooking.paypal_transaction_id || 'No transaction'}
                    </span>
                  </div>
                  {selectedBooking.paypal_order_id && (
                    <div>
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">PayPal Order ID</span>
                      <span className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded border">
                        {selectedBooking.paypal_order_id}
                      </span>
                    </div>
                  )}
                  {selectedBooking.paypal_payer_email && (
                    <div>
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Payer Email</span>
                      <span className="text-gray-700">{selectedBooking.paypal_payer_email}</span>
                    </div>
                  )}
                  {selectedBooking.updated_at && (
                    <div>
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Last Updated</span>
                      <span className="text-gray-700">
                        {new Date(selectedBooking.updated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Timeline / History */}
                <div className="pt-3 mt-3 border-t border-indigo-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Payment Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-gray-600">
                        Booking created — {selectedBooking.created_at
                          ? new Date(selectedBooking.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </span>
                    </div>
                    {selectedBooking.payment_status === 'completed' && selectedBooking.paypal_transaction_id && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-green-700 font-medium">
                          PayPal payment captured — Transaction: {selectedBooking.paypal_transaction_id}
                          {selectedBooking.updated_at && (
                            <span className="text-gray-400 font-normal ml-2">
                              {new Date(selectedBooking.updated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedBooking.payment_status === 'failed' && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-red-600 font-medium">
                          Payment failed
                          {selectedBooking.updated_at && (
                            <span className="text-gray-400 font-normal ml-2">
                              {new Date(selectedBooking.updated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedBooking.payment_status === 'pending' && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <span className="text-yellow-700">
                          {selectedBooking.payment_method === 'cash' ? 'Cash payment — will be collected on tour day' : 'Awaiting PayPal payment...'}
                        </span>
                      </div>
                    )}
                    {selectedBooking.payment_status === 'refunded' && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-blue-700 font-medium">Payment refunded</span>
                      </div>
                    )}
                    {selectedBooking.booking_status === 'cancelled' && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-red-600">Booking cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking ID Reference */}
              <div className="text-xs text-gray-400 pt-2 border-t">
                Booking ID: <span className="font-mono">{selectedBooking.id}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {selectedBooking.booking_status !== 'completed' && selectedBooking.booking_status !== 'cancelled' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                    >
                      Cancel Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourBookingsPage;
