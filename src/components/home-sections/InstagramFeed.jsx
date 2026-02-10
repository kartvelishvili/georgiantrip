import React from 'react';
import { Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstagramFeed = () => {
  const images = [
     'Scenic mountain road in Kazbegi',
     'Old Tbilisi balcony with flowers',
     'Martvili canyon turquoise water',
     'Ushguli stone towers in Svaneti'
  ];

  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
           <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
                 <Instagram className="w-6 h-6 text-pink-600" />
                 Follow us on Instagram
              </h2>
              <p className="text-gray-500 text-sm mt-1">@georgiantrip_official • Share your journey with #GeorgianTrip</p>
           </div>
           <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50 hover:text-pink-800">
             Follow Us
           </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {images.map((alt, i) => (
             <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative">
                <img alt={alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://images.unsplash.com/photo-1615003380049-a716b685b98e" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Instagram className="w-8 h-8 text-white" />
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;