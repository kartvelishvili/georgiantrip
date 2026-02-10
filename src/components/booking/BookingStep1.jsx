import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Minus, Plus, Star, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const BookingStep1 = ({ data, onNext, onUpdateData, car, searchParams }) => {
  const { passengerCount } = data;

  // Safe access to searchParams with defaults
  const params = searchParams || {};
  const startLocation = params.startLocation || { name: 'Tbilisi', name_en: 'Tbilisi' };
  const endLocation = params.endLocation || { name: 'Batumi', name_en: 'Batumi' };
  const date = params.date || new Date().toISOString().split('T')[0];
  const distance = params.distance || 0;
  
  // Handle duration display safely
  let durationDisplay = "5h 30m";
  if (params.duration) {
      // If it's a string (already formatted)
      if (typeof params.duration === 'string') {
          durationDisplay = params.duration;
      } 
      // If it's a number (minutes)
      else if (typeof params.duration === 'number') {
          durationDisplay = `${Math.floor(params.duration / 60)}h ${params.duration % 60}m`;
      }
  }

  const handleIncrement = () => {
    if (passengerCount < car.seats) {
      onUpdateData({ passengerCount: passengerCount + 1 });
    }
  };

  const handleDecrement = () => {
    if (passengerCount > 1) {
      onUpdateData({ passengerCount: passengerCount - 1 });
    }
  };

  // Mask phone: +995 555 ****56
  const maskPhone = (phone) => {
    if (!phone) return 'Hidden';
    const clean = phone.replace(/\s/g, '');
    if (clean.length < 8) return phone;
    return `${clean.slice(0, 6)} ****${clean.slice(-2)}`;
  };

  const driver = car.driver || {};
  const driverName = `${driver.first_name} ${driver.last_name || ''}`;

  return (
    <div className="space-y-6">
      {/* Trip Details Card */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-0.5 h-10 bg-gray-300 border-l border-dashed border-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">From</p>
              <p className="text-sm font-bold text-gray-900">{startLocation.name || startLocation.name_en || 'Unknown Location'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">To</p>
              <p className="text-sm font-bold text-gray-900">{endLocation.name || endLocation.name_en || 'Unknown Location'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
           <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-gray-400" />
             <span className="text-sm font-medium text-gray-700">{date}</span>
           </div>
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-gray-400" />
             <span className="text-sm font-medium text-gray-700">{searchParams?.time || 'Flexible'}</span>
           </div>
           <div className="flex items-center gap-2 col-span-2">
             <Badge variant="outline" className="text-gray-600 bg-white">
               {typeof distance === 'number' ? distance.toFixed(0) : distance} km
             </Badge>
             <span className="text-xs text-gray-400">•</span>
             <Badge variant="outline" className="text-gray-600 bg-white">
               approx. {durationDisplay}
             </Badge>
           </div>
        </div>
      </div>

      {/* Passenger Count */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <span className="font-bold text-gray-700">Passengers</span>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleDecrement} disabled={passengerCount <= 1}>
            <Minus className="w-3 h-3" />
          </Button>
          <span className="font-bold text-lg w-4 text-center">{passengerCount}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleIncrement} disabled={passengerCount >= car.seats}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Driver & Car Info */}
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
           <img src={driver.avatar_url || "https://placehold.co/100x100"} alt="Driver" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
           <h4 className="font-bold text-gray-900">{driverName}</h4>
           <div className="flex items-center gap-1 text-xs text-orange-500 mb-0.5">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-bold">{driver.rating || 'New'}</span>
              <span className="text-gray-400">({driver.reviews_count || 0} reviews)</span>
           </div>
           <p className="text-xs text-gray-500">{car.make} {car.model} • <span className="font-mono bg-gray-100 px-1 rounded">{car.license_plate}</span></p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 p-4 bg-green-50 rounded-xl border border-green-100">
         <div className="flex justify-between text-sm text-gray-600">
           <span>Base price</span>
           <span>{formatCurrency(car.price)}</span>
         </div>
         <div className="flex justify-between items-end border-t border-green-200 pt-2">
           <span className="font-bold text-green-900">Final Price</span>
           <span className="text-2xl font-bold text-green-700">{formatCurrency(car.price)}</span>
         </div>
         <p className="text-xs text-green-600/70 text-right">Includes all taxes and fees</p>
      </div>

      <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700" onClick={onNext}>
        Next: Passenger Details
      </Button>
    </div>
  );
};

export default BookingStep1;