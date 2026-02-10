import React from 'react';
import HeroSearch from '@/components/customer/HeroSearch';

const TransferSearchForm = ({ startLocation, endLocation, onSearch }) => {
  // We prepare initial data for HeroSearch to pre-fill it
  const today = new Date().toISOString().split('T')[0];
  
  const initialData = {
    startLocation: startLocation, 
    endLocation: endLocation,
    stops: [],
    date: today
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 -mt-8 relative z-10">
      <HeroSearch 
         compact={true}
         initialData={initialData}
         onSearch={onSearch}
      />
    </div>
  );
};

export default TransferSearchForm;