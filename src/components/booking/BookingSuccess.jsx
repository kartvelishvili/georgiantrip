import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Navigation, Phone, MessageSquare, Share2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const BookingSuccess = ({ booking, car, searchParams, onDetails }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="text-center space-y-6 pt-4">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
           <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Booking Requested!</h2>
        <p className="text-gray-500 text-sm">Booking ID: <span className="font-mono text-gray-700">#{booking?.id?.slice(0, 8).toUpperCase()}</span></p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
         <div className="flex items-center justify-center gap-2 text-blue-800 font-bold mb-1">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Driver confirming in {formatTime(timeLeft)}</span>
         </div>
         <p className="text-xs text-blue-600/80">
            Please wait while the driver accepts your request.
         </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-left">
         <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
               <img src={car.driver?.avatar_url || "https://placehold.co/100"} className="w-full h-full object-cover" />
            </div>
            <div>
               <p className="font-bold text-gray-900">{car.driver?.first_name} {car.driver?.last_name}</p>
               <p className="text-xs text-gray-500">{car.make} {car.model} • {car.license_plate}</p>
            </div>
         </div>
         
         <div className="space-y-2">
            <div className="flex justify-between text-sm">
               <span className="text-gray-500">Route</span>
               <span className="font-medium text-right truncate max-w-[200px]">{searchParams.startLocation?.name} → {searchParams.endLocation?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-gray-500">Total Price</span>
               <span className="font-bold text-green-600">{formatCurrency(booking?.total_price || 0)}</span>
            </div>
         </div>
      </div>

      <div className="space-y-3 pt-2">
        <Button 
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold"
          onClick={() => navigate(`/bookings/${booking.id}`)}
        >
          View Full Booking
        </Button>
        <Button variant="ghost" className="w-full text-gray-500" onClick={() => navigate('/search-results')}>
          Back to Search
        </Button>
      </div>
    </div>
  );
};

export default BookingSuccess;