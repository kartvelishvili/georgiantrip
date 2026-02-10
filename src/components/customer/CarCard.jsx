import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Briefcase, Gauge, Fuel } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const CarCard = ({ car, driver, price, onSelect }) => {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 group flex flex-col md:flex-row">
      {/* Car Image Section */}
      <div className="w-full md:w-1/3 relative h-48 md:h-auto overflow-hidden bg-gray-100">
         {car.main_photo ? (
             <img 
               src={car.main_photo} 
               alt={`${car.make} ${car.model}`} 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
             />
         ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
         )}
         <div className="absolute top-3 left-3">
             <Badge className="bg-white/90 text-black hover:bg-white shadow-sm border-0 backdrop-blur-sm">
                 {car.year}
             </Badge>
         </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                      {car.make} {car.model}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                     <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-semibold">{car.transmission}</span>
                     <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-semibold">{car.fuel_type}</span>
                  </div>
              </div>
              
              {/* Price (Mobile only, hidden on desktop usually or styled differently) */}
              <div className="md:hidden text-right">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(price)}</div>
              </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-white shadow-sm">
                  {driver.avatar_url ? (
                      <img src={driver.avatar_url} alt={driver.first_name} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 font-bold">{driver.first_name[0]}</div>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 truncate">{driver.first_name} {driver.last_name}</span>
                      <ShieldCheckIcon />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1 text-orange-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold">{driver.rating}</span>
                      </div>
                      <span>• {driver.reviews_count} reviews</span>
                      <span className="truncate">• {driver.languages_spoken?.join(', ')}</span>
                  </div>
              </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Max {car.seats} passengers</span>
              </div>
              <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>Max {car.luggage_capacity} bags</span>
              </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="hidden md:block">
                  <div className="text-xs text-gray-400 font-medium uppercase">Total Price</div>
                  <div className="text-2xl font-bold text-green-600 leading-none">{formatCurrency(price)}</div>
              </div>
              <Button 
                onClick={() => onSelect(car, driver, price)} 
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 font-bold px-8 shadow-md shadow-green-100"
              >
                  Book Transfer
              </Button>
          </div>
      </div>
    </Card>
  );
};

const ShieldCheckIcon = () => (
    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export default CarCard;