
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, Calendar, MapPin, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

const BookingsManagementPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                  *,
                  pickup_location:locations!pickup_location_id(name_en),
                  dropoff_location:locations!dropoff_location_id(name_en),
                  driver:drivers(first_name, last_name, phone)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId);
            
            if (error) throw error;
            
            toast({ title: 'Status Updated', description: `Booking is now ${newStatus}` });
            fetchBookings();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a cancellation reason.' });
            return;
        }

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ 
                    status: 'cancelled',
                    rejection_reason: cancelReason 
                })
                .eq('id', selectedBooking.id);
            
            if (error) throw error;
            
            toast({ title: 'Booking Cancelled', description: 'User has been notified.' });
            setIsCancelModalOpen(false);
            setCancelReason('');
            fetchBookings();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.id.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'completed': return 'default'; // dark/black
            case 'confirmed': return 'secondary'; // gray
            case 'pending': return 'warning'; // custom class needed usually, defaulting to yellow text
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Bookings Management</h1>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">All Transactions</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder="Search passenger or ID..." 
                                className="pl-9 w-[250px]" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bookings</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Route & Date</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading bookings...</TableCell>
                                    </TableRow>
                                ) : filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">No bookings found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <div className="font-medium">{booking.customer_first_name}</div>
                                                <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm mb-1">
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                    {booking.pickup_location?.name_en} → {booking.dropoff_location?.name_en}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {format(new Date(booking.date), 'MMM dd, yyyy')} • {booking.time}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {booking.driver ? (
                                                    <span className="text-sm font-medium">{booking.driver.first_name} {booking.driver.last_name}</span>
                                                ) : (
                                                    <span className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(booking.status)}>
                                                    {booking.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                ₾{booking.total_price}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Select 
                                                   defaultValue={booking.status} 
                                                   onValueChange={(val) => handleStatusUpdate(booking.id, val)}
                                                >
                                                   <SelectTrigger className="w-[110px] h-8 text-xs inline-flex">
                                                      <SelectValue />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                      <SelectItem value="pending">Pending</SelectItem>
                                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                                      <SelectItem value="completed">Completed</SelectItem>
                                                   </SelectContent>
                                                </Select>
                                                
                                                {booking.status !== 'cancelled' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-600 h-8 w-8 p-0"
                                                        onClick={() => { setSelectedBooking(booking); setIsCancelModalOpen(true); }}
                                                    >
                                                        <XCircle className="w-4 h-4" />
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

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel the booking for {selectedBooking?.customer_first_name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reason" className="mb-2 block">Cancellation Reason</Label>
                        <Input 
                            id="reason" 
                            placeholder="e.g. Driver unavailable, Customer request..." 
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Keep Booking</Button>
                        <Button variant="destructive" onClick={handleCancelBooking}>Confirm Cancellation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingsManagementPage;
