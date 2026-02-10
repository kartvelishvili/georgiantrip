import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/currencyUtils';

const TourCard = ({ tour }) => {
  // Use first gallery image if available, fallback to image_url or placeholder
  const displayImage = tour.gallery_images?.[0] || tour.image_url || 'https://images.unsplash.com/photo-1589792923962-537704632910?w=800&auto=format&fit=crop';

  return (
    <Link to={`/tours/${tour.id}`} className="group block h-full">
      <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={displayImage} 
            alt={tour.name_en}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Base Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
          
          {/* Hover Overlay - Darkens slightly more */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold">{tour.rating || 5.0}</span>
            <span className="text-xs text-gray-200">({tour.reviews_count || 0})</span>
          </div>

          <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-2 leading-tight drop-shadow-md">
              {tour.name_en}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{tour.duration_days ?? '—'} Day{(tour.duration_days ?? 0) > 1 ? 's' : ''}</span>
              </div>
            </div>

            <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 h-0 group-hover:h-auto">
              {tour.description_en}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">From</p>
                <p className="text-xl font-bold text-green-400">
                  {formatPrice(tour.price_per_person)}
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-500 text-white rounded-full px-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                View Tour <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;