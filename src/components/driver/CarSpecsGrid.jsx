import React from 'react';
import { Users, Briefcase, Settings2, Fuel } from 'lucide-react';

const CarSpecsGrid = ({ seats, luggage, transmission, fuel, compact = false }) => {
  return (
    <div className={`grid ${compact ? 'grid-cols-2 gap-x-2 gap-y-2' : 'grid-cols-2 sm:grid-cols-4 gap-4'} w-full`}>
      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <Users className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500`} />
        <div className="flex flex-col">
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{seats} Seats</span>
          {!compact && <span className="text-[10px] text-gray-400 uppercase">Capacity</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <Briefcase className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500`} />
        <div className="flex flex-col">
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{luggage} Bags</span>
          {!compact && <span className="text-[10px] text-gray-400 uppercase">Luggage</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <Settings2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500`} />
        <div className="flex flex-col">
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{transmission}</span>
          {!compact && <span className="text-[10px] text-gray-400 uppercase">Gearbox</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <Fuel className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500`} />
        <div className="flex flex-col">
          <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{fuel}</span>
          {!compact && <span className="text-[10px] text-gray-400 uppercase">Fuel Type</span>}
        </div>
      </div>
    </div>
  );
};

export default CarSpecsGrid;