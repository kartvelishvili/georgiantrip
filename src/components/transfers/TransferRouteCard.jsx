import React from 'react';
import { ArrowRight, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const TransferRouteCard = ({ transfer }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/transfer/${transfer.id}`);
  };

  const fromName = transfer.from_location?.name_en || 'Origin';
  const toName = transfer.to_location?.name_en || 'Destination';
  const bgImage = transfer.image_url || 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=600&auto=format&fit=crop';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="group relative w-[280px] h-[200px] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-gray-900"
    >
      {/* Background Image */}
      <img 
        src={bgImage} 
        alt={`${fromName} to ${toName}`} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80 transition-all duration-300 group-hover:bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
        
        {/* Top Section: Route */}
        <div className="flex justify-between items-start w-full">
           <span className="text-white font-bold text-sm bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-sm max-w-[40%] truncate">
              {fromName}
           </span>
           
           <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full text-white">
              <ArrowRight className="w-3 h-3" />
           </div>

           <span className="text-white font-bold text-sm bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-sm max-w-[40%] truncate">
              {toName}
           </span>
        </div>

        {/* Bottom Section: Info & Action */}
        <div className="flex justify-between items-end">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
                 <Navigation className="w-3 h-3" />
                 <span>{transfer.distance_km} km</span>
              </div>
           </div>

           <Button 
             size="sm"
             className="bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20 text-xs font-bold px-3 h-8 rounded-lg"
           >
             View Cars
           </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TransferRouteCard;