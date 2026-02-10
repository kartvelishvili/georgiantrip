import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const TransferCard = ({ transfer }) => {
  const { currentLanguage } = useLanguage();

  const getLocName = (loc) => {
    if (!loc) return '';
    switch (currentLanguage) {
      case 'ka': return loc.name_ka || loc.name_en;
      case 'ru': return loc.name_ru || loc.name_en;
      default: return loc.name_en;
    }
  };

  // Fallback image if none provided
  const bgImage = transfer.image_url || 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600';

  return (
    <Link 
      to={`/transfer/s/${transfer.slug}`} 
      className="group relative block w-full h-[200px] overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-md cursor-pointer"
    >
      {/* Background with Green Gradient Dominance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#10B981] to-[#059669] z-0" />
      
      {/* Subtle Background Image */}
      <div className="absolute inset-0 z-0">
         <img 
            src={bgImage} 
            alt={`${getLocName(transfer.from_location)} - ${getLocName(transfer.to_location)}`}
            className="w-full h-full object-cover opacity-15 mix-blend-overlay group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 ease-out grayscale-[20%]"
         />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between text-white">
        
        {/* Route Info */}
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-3">
          <div className="w-full">
            <h3 className="text-xl md:text-2xl font-bold font-heading leading-tight drop-shadow-sm">
              {getLocName(transfer.from_location)}
            </h3>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full border border-white/30 group-hover:bg-white/30 transition-colors">
               <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="w-full">
             <h3 className="text-xl md:text-2xl font-bold font-heading leading-tight drop-shadow-sm">
               {getLocName(transfer.to_location)}
             </h3>
          </div>
        </div>

        {/* Footer Info: Distance & Price */}
        <div className="flex items-end justify-between w-full pt-4 mt-auto border-t border-white/10">
           <div className="flex items-center gap-1.5 opacity-90">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium tracking-wide">
                {transfer.distance_km ?? '—'} km
              </span>
           </div>
           
           <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider opacity-80 mb-0.5">From</span>
              <span className="text-lg font-bold leading-none bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                {formatCurrency(transfer.base_price ?? 0)}
              </span>
           </div>
        </div>
      </div>
      
      {/* Hover Overlay Lighten Effect */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 z-20 pointer-events-none" />
    </Link>
  );
};

export default TransferCard;