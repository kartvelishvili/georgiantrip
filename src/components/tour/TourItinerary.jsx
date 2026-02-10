import React from 'react';
import { MapPin } from 'lucide-react';

const TourItinerary = ({ itinerary }) => {
  if (!itinerary || !Array.isArray(itinerary)) return null;

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-heading font-bold text-gray-900">Itinerary</h3>
      
      <div className="relative pl-8 border-l-2 border-gray-100 space-y-12">
        {itinerary.map((day, index) => (
          <div key={index} className="relative">
             <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-green-600 border-4 border-white shadow-sm"></div>
             
             <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs uppercase tracking-wide">Day {day.day}</span>
                    {day.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                    {day.description}
                </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourItinerary;