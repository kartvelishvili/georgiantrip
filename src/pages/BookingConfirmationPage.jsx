import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTourBooking } from '@/lib/bookingService';
import { formatPriceDetail } from '@/lib/currencyUtils';
import { CheckCircle, Printer, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Explicitly using getTourBooking for tour confirmations
        const data = await getTourBooking(bookingId);
        setBooking(data);
      } catch (error) {
        console.error("Failed to fetch booking", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>;
  if (!booking) return <div className="h-screen flex items-center justify-center">Booking not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Success header */}
      <div className="bg-gray-950 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-gray-950 to-gray-950 z-0" />
        <div className="container-custom max-w-3xl relative z-10 text-center">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400">Thank you for your booking. A confirmation email has been sent to {booking.passenger_email}.</p>
        </div>
      </div>

      <div className="container-custom max-w-3xl -mt-4 relative z-10">
        <Card className="p-8 shadow-lg border border-gray-100 rounded-2xl">
            <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{booking.tours?.name_en}</h2>
                    <p className="text-gray-500">Booking ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{booking.id}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {booking.payment_status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Date:</span>
                            <span className="font-medium text-gray-900">{new Date(booking.tour_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Travelers:</span>
                            <span className="font-medium text-gray-900">{booking.passenger_count} People</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium text-gray-900">{booking.tours?.duration_days} Days</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Info</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>{booking.passenger_name}</p>
                        <p>{booking.passenger_email}</p>
                        <p>{booking.passenger_phone}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount Paid</span>
                    <span className="text-green-700">{formatPriceDetail(booking.total_price_gel)}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" /> Print Receipt
                </Button>
                <Link to="/">
                    <Button variant="outline">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Button>
                </Link>
                <Link to="/tours">
                     <Button className="bg-green-600 hover:bg-green-700">
                        Explore More Tours <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                </Link>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;