import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, User, Car as CarIcon, Briefcase, Users, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const CarResultCard = ({ car, onBook, vertical = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDetails = (e) => {
    if (e) e.stopPropagation();
    const searchParams = new URLSearchParams(location.search);
    navigate(`/car/${car.id}?${searchParams.toString()}`);
  };

  const rating = car.drivers?.rating || null;
  const driverFirst = car.drivers?.first_name || '';
  const driverLastInit = car.drivers?.last_name ? car.drivers.last_name[0] + '.' : '';
  const driverName = `${driverFirst} ${driverLastInit}`.trim() || 'Driver';
  const price = car.calculatedPrice || car.price || 0;

  return (
    <div 
        onClick={handleViewDetails}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Car Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
          {car.main_photo ? (
              <img 
                  src={car.main_photo} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <CarIcon className="w-12 h-12" />
              </div>
          )}
          {/* Rating badge */}
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
             <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
             {rating || 'New'}
          </div>
      </div>

      {/* Content */}
      <div className="p-4">
          {/* Car name */}
          <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
              {car.make} {car.model}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 mb-3">{car.year} • {car.license_plate}</p>

          {/* Driver */}
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden flex items-center justify-center border-2 border-green-200">
                  {car.drivers?.avatar_url ? (
                      <img src={car.drivers.avatar_url} alt={driverName} className="w-full h-full object-cover" />
                  ) : (
                      <User className="w-4 h-4 text-green-600" />
                  )}
             </div>
             <div className="min-w-0">
                 <p className="text-sm font-semibold text-gray-800 truncate">{driverName}</p>
                 <div className="flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                   <span className="text-xs text-green-600 font-medium">Verified Driver</span>
                 </div>
             </div>
          </div>

          {/* Features */}
          <div className="flex gap-2 mb-4">
              <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Users className="w-3 h-3" /> {car.seats} Seats
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Briefcase className="w-3 h-3" /> {car.luggage_capacity || 2} Bags
              </span>
          </div>

          {/* Price + Book */}
          <div className="flex items-center justify-between gap-3">
              <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total Price</span>
                  <div className="text-lg font-extrabold text-gray-900">{formatCurrency(price)}</div>
              </div>
              <Button 
                onClick={(e) => { e.stopPropagation(); onBook && onBook(car); }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 rounded-xl shadow-md shadow-green-600/15"
              >
                  Book Now
              </Button>
          </div>
      </div>
    </div>
  );
};

export default CarResultCard;