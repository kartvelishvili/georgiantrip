import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PopularDestinationsLinks = () => {
  const routes = [
    { from: 'tbilisi', to: 'batumi', label: 'Tbilisi to Batumi' },
    { from: 'tbilisi', to: 'kazbegi', label: 'Tbilisi to Kazbegi' },
    { from: 'kutaisi-airport', to: 'tbilisi', label: 'Kutaisi Airport to Tbilisi' },
    { from: 'batumi', to: 'tbilisi', label: 'Batumi to Tbilisi' },
    { from: 'tbilisi', to: 'borjomi', label: 'Tbilisi to Borjomi' },
    { from: 'tbilisi', to: 'gudauri', label: 'Tbilisi to Gudauri' },
    { from: 'kutaisi', to: 'tbilisi', label: 'Kutaisi to Tbilisi' },
    { from: 'tbilisi', to: 'mestia', label: 'Tbilisi to Mestia' },
    { from: 'batumi', to: 'mestia', label: 'Batumi to Mestia' },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8">
           Popular taxi destinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
           {routes.map((route, i) => (
             <Link 
               key={i} 
               to={`/transfer/from-${route.from}/to-${route.to}`}
               className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 text-gray-700 hover:text-green-600 hover:border-green-200 hover:shadow-md transition-all group"
             >
                <span className="font-medium">{route.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
             </Link>
           ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinationsLinks;