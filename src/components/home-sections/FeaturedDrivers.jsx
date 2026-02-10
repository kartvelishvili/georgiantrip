import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedDrivers = () => {
  const drivers = [
    { name: 'Giorgi B.', rating: 4.9, reviews: 120, lang: ['EN', 'RU', 'KA'], alt: 'Friendly Georgian driver Giorgi' },
    { name: 'Levan M.', rating: 5.0, reviews: 85, lang: ['EN', 'KA'], alt: 'Professional driver Levan in suit' },
    { name: 'Nino K.', rating: 4.8, reviews: 45, lang: ['EN', 'RU', 'KA'], alt: 'Female driver Nino smiling' },
    { name: 'David G.', rating: 4.9, reviews: 200, lang: ['RU', 'KA'], alt: 'Experienced driver David' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Meet Our Top Drivers</h2>
          <p className="text-gray-600">Professional, verified, and rated by travelers like you.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {drivers.map((driver, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 shadow-soft hover:shadow-lg transition-all text-center group">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-green-100 group-hover:border-green-500 transition-colors">
                  <img alt={driver.alt} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1546661424-796f69a5ff97" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-600 text-white p-1 rounded-full border-2 border-white">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900">{driver.name}</h3>
              
              <div className="flex items-center justify-center gap-1 my-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-900">{driver.rating}</span>
                <span className="text-gray-400 text-sm">({driver.reviews} reviews)</span>
              </div>
              
              <div className="flex justify-center gap-1 mb-4">
                {driver.lang.map(l => (
                  <span key={l} className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{l}</span>
                ))}
              </div>
              
              <Button variant="outline" className="w-full text-sm h-9">View Profile</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDrivers;