import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';

const PopularDestinations = () => {
  const { t } = useLanguage();

  const destinations = [
    { title: 'Tbilisi - Gudauri', price: '170', imageAlt: 'Snowy mountains of Gudauri ski resort' },
    { title: 'Tbilisi - Kazbegi', price: '200', imageAlt: 'Gergeti Trinity Church in Kazbegi mountains' },
    { title: 'Tbilisi - Batumi', price: '350', imageAlt: 'Modern skyline of Batumi on Black Sea coast' },
    { title: 'Kutaisi - Tbilisi', price: '220', imageAlt: 'Historic Bagrati Cathedral in Kutaisi' },
    { title: 'Tbilisi - Signagi', price: '160', imageAlt: 'City of Love Signagi with red roofs' },
    { title: 'Tbilisi - Borjomi', price: '190', imageAlt: 'Green forests and mineral waters of Borjomi' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
           <div>
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">{t('popularDestinations')}</h2>
              <p className="text-gray-600">Explore the most traveled routes in Georgia</p>
           </div>
           <Button variant="outline" className="hidden md:flex">
             View All Routes <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <div key={index} className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
              <img alt={dest.imageAlt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex justify-between items-end">
                   <div>
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold uppercase tracking-wider mb-1">
                         <MapPin className="w-3 h-3" /> Popular Route
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{dest.title}</h3>
                      <p className="text-white/80 text-sm">approx. {Math.floor(Math.random() * 3 + 2)} hours</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-white/70">from</p>
                      <p className="text-2xl font-bold text-green-400">{dest.price} ₾</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 md:hidden text-center">
           <Button variant="outline" className="w-full">
             View All Routes <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;