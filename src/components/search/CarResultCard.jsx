import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, User, Car as CarIcon, Briefcase, Users, Shield, ChevronRight, Fuel, Settings2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
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
  const driverName = `${car.drivers?.first_name || ''} ${car.drivers?.last_name?.[0] || ''}.`.trim();
  const price = car.calculatedPrice || car.price || 0;

  return (
    <div 
        onClick={handleViewDetails}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 overflow-hidden group cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Car Image */}
        <div className="relative sm:w-72 h-52 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden shrink-0">
          {car.main_photo ? (
            <img 
              src={car.main_photo} 
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <CarIcon className="w-16 h-16" />
            </div>
          )}
          {/* Rating badge */}
          {rating && (
            <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {rating}
            </div>
          )}
          {/* Car class badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700">
            {car.year} • {car.car_class || 'Standard'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          {/* Top: Car name + Driver */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">{car.year} • {car.license_plate}</p>
            </div>
            {/* Driver avatar + name */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{driverName}</p>
                <div className="flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Verified</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 overflow-hidden flex items-center justify-center border-2 border-green-200 shadow-sm">
                {car.drivers?.avatar_url ? (
                  <img src={car.drivers.avatar_url} alt={driverName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* Features row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" /> {car.seats} Seats
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
              <Briefcase className="w-3.5 h-3.5" /> {car.luggage_capacity || 2} Bags
            </span>
            {car.fuel_type && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <Fuel className="w-3.5 h-3.5" /> {car.fuel_type}
              </span>
            )}
            {car.transmission && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <Settings2 className="w-3.5 h-3.5" /> {car.transmission}
              </span>
            )}
          </div>

          {/* Bottom: Price + CTA */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(price)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={(e) => { e.stopPropagation(); onBook && onBook(car); }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-300"
              >
                Book Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarResultCard;