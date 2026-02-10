import React from 'react';
import { Check, Shield, Zap, Sparkles, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

const CarSpecs = ({ car }) => {
  // Parsing JSONB fields safely or using fallbacks
  const features = Array.isArray(car.features) ? car.features : [];
  
  // Mock data if columns are empty (since we just added them)
  const amenities = Array.isArray(car.amenities) && car.amenities.length > 0 
      ? car.amenities 
      : ['WiFi', 'Water Bottles', 'Phone Charger', 'Air Conditioning'];

  const safetyFeatures = Array.isArray(car.safety_features) && car.safety_features.length > 0
      ? car.safety_features
      : ['ABS Brakes', 'Airbags', 'First Aid Kit', 'Fire Extinguisher'];
      
  const specs = car.specifications || {
     engine: '2.5L Hybrid',
     fuel: car.fuel_type || 'Hybrid',
     transmission: car.transmission || 'Automatic',
     color: car.color || 'White'
  };

  return (
    <div className="space-y-8">
       {/* Specifications */}
       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <Car className="w-5 h-5 text-blue-500" />
             <h3 className="font-bold text-gray-900 text-lg">Specifications</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                   <p className="text-xs text-gray-500 uppercase font-bold mb-1">{key}</p>
                   <p className="font-medium text-gray-900 capitalize">{value}</p>
                </div>
             ))}
          </div>
       </div>

       {/* Amenities */}
       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <Sparkles className="w-5 h-5 text-yellow-500" />
             <h3 className="font-bold text-gray-900 text-lg">Amenities</h3>
          </div>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
             {amenities.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                   <div className="w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                      <Check className="w-3 h-3" />
                   </div>
                   {item}
                </li>
             ))}
          </ul>
       </div>

       {/* Safety Features */}
       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <Shield className="w-5 h-5 text-green-500" />
             <h3 className="font-bold text-gray-900 text-lg">Safety Features</h3>
          </div>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
             {safetyFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                   <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      <Shield className="w-3 h-3" />
                   </div>
                   {item}
                </li>
             ))}
          </ul>
       </div>
    </div>
  );
};

export default CarSpecs;