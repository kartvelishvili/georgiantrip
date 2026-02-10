import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Wind, Wifi, Battery, Volume2, Shield, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import CarGallery from '@/components/car/CarGallery';

const CarDetails = ({ car }) => {
  // Safe defaults
  const features = car.features || [];
  const specs = car.specifications || {};
  const safety = car.safety_features || [];
  const amenities = car.amenities || [];
  
  // Combine all images: main photo + gallery images
  // Ensure main_photo is first if it exists
  const allImages = [];
  if (car.main_photo) allImages.push(car.main_photo);
  
  // Add additional images from the 'images' relation if fetched via getCarById
  if (car.images && Array.isArray(car.images)) {
     car.images.forEach(img => {
         if (img.image_url && img.image_url !== car.main_photo) {
             allImages.push(img.image_url);
         }
     });
  }
  // Also check if there's an old text array 'photos_urls' and merge if needed (legacy support)
  if (car.photos_urls && Array.isArray(car.photos_urls)) {
      car.photos_urls.forEach(url => {
          if (url && !allImages.includes(url)) allImages.push(url);
      });
  }

  // Fallback if no images
  if (allImages.length === 0) {
      allImages.push("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000");
  }

  const amenityIcons = {
    'wifi': Wifi,
    'ac': Wind,
    'charging': Battery,
    'music': Volume2,
    'safety': Shield
  };

  return (
    <div className="space-y-8">
      {/* Gallery Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
         <CarGallery images={allImages} />
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">Vehicle Description</h3>
        <div className="prose prose-sm max-w-none text-gray-600">
           <p>{car.description || `Experience a comfortable ride in this ${car.year} ${car.make} ${car.model}. Maintained to the highest standards, this vehicle offers a perfect blend of comfort and reliability for your Georgian journey.`}</p>
        </div>

        {amenities.length > 0 && (
          <div className="mt-6">
             <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Amenities</h4>
             <div className="flex flex-wrap gap-3">
               {amenities.map((item, i) => {
                  const Icon = amenityIcons[item.key] || Check;
                  return (
                     <Badge key={i} variant="secondary" className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 gap-2">
                        <Icon className="w-3 h-3" />
                        {item.label || item}
                     </Badge>
                  );
               })}
             </div>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Safety */}
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Shield className="w-5 h-5 text-green-600" />
               Safety Features
            </h3>
            <ul className="space-y-2">
               {safety.length > 0 ? safety.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                     {typeof item === 'string' ? item : item.label}
                  </li>
               )) : (
                 <li className="text-sm text-gray-400 italic">Standard safety features included</li>
               )}
            </ul>
         </div>

         {/* Conditions */}
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-blue-600" />
               Vehicle Conditions
            </h3>
            <ul className="space-y-3 text-sm">
               <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Cleanliness</span>
                  <span className="font-medium text-gray-900">Excellent</span>
               </li>
               <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Technical State</span>
                  <span className="font-medium text-gray-900">Verified</span>
               </li>
               <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Insurance</span>
                  <span className="font-medium text-gray-900 text-green-600">Full Coverage</span>
               </li>
               <li className="flex justify-between">
                  <span className="text-gray-500">Year</span>
                  <span className="font-medium text-gray-900">{car.year}</span>
               </li>
            </ul>
         </div>
      </div>
    </div>
  );
};

export default CarDetails;