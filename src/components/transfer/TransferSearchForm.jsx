import React from 'react';
import HeroSearch from '@/components/customer/HeroSearch';
import { Calendar } from 'lucide-react';

const TransferSearchForm = ({ startLocation, endLocation, onSearch }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const initialData = {
    startLocation: startLocation, 
    endLocation: endLocation,
    stops: [],
    date: today
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 -mt-10 relative z-10">
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-gray-400 font-bold uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5" />
        Select date & customize your trip
      </div>
      <HeroSearch 
         compact={true}
         initialData={initialData}
         onSearch={onSearch}
      />
    </div>
  );
};

export default TransferSearchForm;