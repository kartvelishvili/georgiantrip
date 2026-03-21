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
      className="group relative block w-full h-[220px] overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-green-900/15 shadow-lg cursor-pointer"
    >
      {/* Full background image */}
      <div className="absolute inset-0 z-0">
         <img 
            src={bgImage} 
            alt={`${getLocName(transfer.from_location)} - ${getLocName(transfer.to_location)}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
         />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-emerald-900/80 group-hover:via-emerald-900/30 transition-all duration-500" />

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between text-white">
        
        {/* Route Info */}
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-2">
          <h3 className="text-lg md:text-xl font-bold font-heading leading-tight drop-shadow-lg">
            {getLocName(transfer.from_location)}
          </h3>

          <div className="flex items-center justify-center my-1">
            <div className="h-px w-6 bg-white/40" />
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full border border-white/30 mx-2 group-hover:bg-emerald-500/50 group-hover:border-emerald-300/50 transition-all duration-300 group-hover:rotate-0 -rotate-0">
               <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <div className="h-px w-6 bg-white/40" />
          </div>

          <h3 className="text-lg md:text-xl font-bold font-heading leading-tight drop-shadow-lg">
            {getLocName(transfer.to_location)}
          </h3>
        </div>

        {/* Footer Info: Distance & Price */}
        <div className="flex items-end justify-between w-full pt-3 mt-auto border-t border-white/15">
           <div className="flex items-center gap-1.5 opacity-80">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium tracking-wide">
                {transfer.distance_km ?? '—'} km
              </span>
           </div>
           
           <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">From</span>
              <span className="text-base font-bold leading-none bg-emerald-600/80 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                {formatCurrency(transfer.base_price ?? 0)}
              </span>
           </div>
        </div>
      </div>
    </Link>
  );
};

export default TransferCard;