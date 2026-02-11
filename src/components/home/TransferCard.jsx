import React from 'react';
import { ArrowRight, MapPin, Clock, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

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

  const bgImage = transfer.image_url || 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600';
  const duration = transfer.duration_minutes ? `${Math.floor(transfer.duration_minutes / 60)}h ${transfer.duration_minutes % 60}m` : null;

  return (
    <Link 
      to={`/transfer/s/${transfer.slug}`} 
      className="group relative block w-full aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt={`${getLocName(transfer.from_location)} - ${getLocName(transfer.to_location)}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

      {/* Price badge top-right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-xl text-sm font-extrabold shadow-lg">
          {formatCurrency(transfer.base_price ?? 0)}
        </div>
      </div>

      {/* Content at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-5">
        {/* Route names */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-base md:text-lg leading-tight">
              {getLocName(transfer.from_location)}
            </span>
            <ArrowRight className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-white font-bold text-base md:text-lg leading-tight">
              {getLocName(transfer.to_location)}
            </span>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-3 text-white/70 text-xs font-medium">
          {transfer.distance_km && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {transfer.distance_km} km
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
          )}
        </div>

        {/* Hover CTA */}
        <div className="flex items-center gap-1 text-green-400 text-xs font-bold mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          View Route <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 transition-colors duration-300 pointer-events-none" />
    </Link>
  );
};

export default TransferCard;