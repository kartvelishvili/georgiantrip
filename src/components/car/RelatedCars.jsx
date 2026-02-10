import React, { useEffect, useState } from 'react';
import { getRelatedCars } from '@/lib/carService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Star, Users, ArrowRight } from 'lucide-react';

const RelatedCars = ({ currentCarId, transferId }) => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
       const data = await getRelatedCars(currentCarId, transferId);
       setCars(data);
    };
    if (transferId) {
        fetchCars();
    }
  }, [currentCarId, transferId]);

  if (cars.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-200 pt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Other Cars for this Route</h2>
        <Link to={`/transfer/${transferId}`}>
           <Button variant="ghost" className="text-green-600 hover:text-green-700">
              View All <ArrowRight className="w-4 h-4 ml-1" />
           </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cars.map(car => (
           <Link to={`/car/${car.id}`} key={car.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                 <img 
                   src={car.main_photo} 
                   alt={car.model} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
              </div>
              <div className="p-4">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{car.make} {car.model}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full">
                       <Star className="w-3 h-3 fill-current" />
                       {car.driver?.rating || '5.0'}
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                       <Users className="w-3 h-3" /> {car.seats}
                    </div>
                    <span>•</span>
                    <span>{car.category || 'Standard'}</span>
                 </div>

                 <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(car.price)}</span>
                    <span className="text-xs text-green-600 font-bold uppercase tracking-wide">View Details</span>
                 </div>
              </div>
           </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedCars;