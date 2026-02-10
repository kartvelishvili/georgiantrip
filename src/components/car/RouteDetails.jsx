import React from 'react';
import { MapPin, Calendar, Clock, Navigation, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RouteDetails = ({ 
  fromLocation, 
  toLocation, 
  date, 
  distance, 
  duration, 
  passengers, 
  onPassengerChange 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Trip Details</h3>
      
      <div className="space-y-6">
         {/* Route Visual */}
         <div className="flex gap-4 relative">
            <div className="flex flex-col items-center pt-1">
               <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100"></div>
               <div className="w-0.5 h-full min-h-[40px] bg-gray-200 my-1"></div>
               <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100"></div>
            </div>
            <div className="flex-1 space-y-6">
               <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">From</p>
                  <p className="font-bold text-gray-900">{fromLocation?.name_en || 'Select Location'}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">To</p>
                  <p className="font-bold text-gray-900">{toLocation?.name_en || 'Select Location'}</p>
               </div>
            </div>
         </div>

         <div className="border-t border-gray-100 pt-6 grid grid-cols-2 gap-4">
             <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <Calendar className="w-4 h-4" />
                   <span className="text-xs font-medium uppercase">Date</span>
                </div>
                <p className="font-bold text-sm text-gray-900">{date || 'Not selected'}</p>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <Navigation className="w-4 h-4" />
                   <span className="text-xs font-medium uppercase">Distance</span>
                </div>
                <p className="font-bold text-sm text-gray-900">{distance} km</p>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <Clock className="w-4 h-4" />
                   <span className="text-xs font-medium uppercase">Duration</span>
                </div>
                <p className="font-bold text-sm text-gray-900">~{duration} min</p>
             </div>

             <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <Users className="w-4 h-4" />
                   <span className="text-xs font-medium uppercase">Passengers</span>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full bg-white shadow-sm" onClick={() => onPassengerChange(-1)} disabled={passengers <= 1}>
                      <Minus className="w-3 h-3" />
                   </Button>
                   <span className="font-bold text-sm text-gray-900 w-4 text-center">{passengers}</span>
                   <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full bg-white shadow-sm" onClick={() => onPassengerChange(1)} disabled={passengers >= 8}>
                      <Plus className="w-3 h-3" />
                   </Button>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default RouteDetails;