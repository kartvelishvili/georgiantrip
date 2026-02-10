import React from 'react';
import { Star, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const CarHeader = ({ car }) => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-2">
            {car.make} {car.model}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
               {car.year}
            </Badge>
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
               <Star className="w-4 h-4 fill-current" />
               <span>{car.rating || '5.0'}</span>
               <span className="text-gray-400 font-normal">({car.reviews_count || 12} reviews)</span>
            </div>
            {car.verification_status === 'approved' && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                 <ShieldCheck className="w-4 h-4" /> Verified
              </div>
            )}
          </div>
        </div>

        <div className="text-left md:text-right bg-green-50/50 p-3 rounded-xl border border-green-100 md:bg-transparent md:border-none md:p-0">
           <p className="text-sm text-gray-500 font-medium mb-1">Starting from</p>
           <p className="text-3xl font-bold text-green-600">{formatCurrency(car.price)}</p>
           <p className="text-xs text-gray-400">per trip</p>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm border border-gray-100">
        <img 
          src={car.main_photo || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80'} 
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 left-4 flex gap-2">
           <Badge className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm shadow-sm flex gap-1.5 py-1.5 px-3">
              <Users className="w-3.5 h-3.5" />
              {car.seats} Seats
           </Badge>
           <Badge className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm shadow-sm flex gap-1.5 py-1.5 px-3">
              <Briefcase className="w-3.5 h-3.5" />
              {car.luggage_capacity || 2} Bags
           </Badge>
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none text-gray-600 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
        <p>{car.description || "A comfortable and reliable vehicle perfect for transfers across Georgia. Maintained to high standards with professional service guaranteed."}</p>
      </div>
    </div>
  );
};

export default CarHeader;