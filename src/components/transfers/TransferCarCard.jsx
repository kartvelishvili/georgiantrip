import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, User, Briefcase, Car as CarIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

const TransferCarCard = ({ car, transferId, basePrice }) => {
  const navigate = useNavigate();

  // Navigate to the new detail page
  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(`/car/${car.id}`);
  };

  const displayPrice = basePrice || car.price || 0;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {car.main_photo ? (
          <img 
            src={car.main_photo} 
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <CarIcon className="w-16 h-16 opacity-30" />
          </div>
        )}
        
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm text-xs font-bold text-gray-800 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          {car.driver?.rating || '5.0'} <span className="text-gray-400 font-normal">({car.driver?.reviews_count || 12})</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
            {car.make} {car.model}
          </h3>
          <p className="text-sm text-gray-500 mt-1 font-medium">{car.category || 'Comfort Class'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-center gap-2 group-hover:bg-green-50 transition-colors">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{car.seats} seats</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-center gap-2 group-hover:bg-green-50 transition-colors">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{car.luggage_capacity || 2} bags</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Price</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(displayPrice)}
            </span>
          </div>
          <Button 
            onClick={handleBookClick}
            className="bg-gray-900 hover:bg-green-600 text-white font-bold px-6 shadow-lg shadow-gray-200 hover:shadow-green-200 transition-all duration-300"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransferCarCard;