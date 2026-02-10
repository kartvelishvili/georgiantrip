import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, User, Car as CarIcon, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const CarResultCard = ({ car, onBook, vertical = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Create detail link preserving current search params
  const handleViewDetails = (e) => {
    if (e) e.stopPropagation();
    
    // Construct robust URL preserving all search parameters (date, from, to, transfer, etc.)
    const searchParams = new URLSearchParams(location.search);
    navigate(`/car/${car.id}?${searchParams.toString()}`);
  };

  return (
    <div 
        onClick={handleViewDetails}
        className={cn(
            "bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer hover:ring-2 hover:ring-green-500/20",
    )}>
      {/* Car Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
          {car.main_photo ? (
              <img 
                  src={car.main_photo} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <CarIcon className="w-12 h-12 opacity-50" />
              </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm text-xs font-bold text-gray-800 flex items-center gap-1">
             <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
             {car.drivers?.rating || 'New'}
          </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
                  {car.make} {car.model}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{car.year} • {car.license_plate}</p>
          </div>

          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
             <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                  {car.drivers?.avatar_url ? (
                      <img src={car.drivers.avatar_url} alt="Driver" className="w-full h-full object-cover" />
                  ) : (
                      <User className="w-4 h-4 text-gray-400" />
                  )}
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-900">{car.drivers?.first_name} {car.drivers?.last_name?.[0]}.</p>
                 <p className="text-xs text-green-600 font-medium">Verified Driver</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                  <User className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-700">{car.seats} Seats</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-700">{car.luggage_capacity || 2} Bags</span>
              </div>
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Total Price</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(car.calculatedPrice || car.price || 0)}</span>
              </div>
              <Button 
                onClick={handleViewDetails}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 shadow-lg shadow-green-100"
              >
                  Book Now
              </Button>
          </div>
      </div>
    </div>
  );
};

export default CarResultCard;