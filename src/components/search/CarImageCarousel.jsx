import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const CarImageCarousel = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Ensure we have at least one image or a placeholder
  const displayImages = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'];

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 group">
      <img
        src={displayImages[currentIndex]}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Dots */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all shadow-sm backdrop-blur-sm",
                currentIndex === idx 
                  ? "bg-white w-4" 
                  : "bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}
      
      {/* Gradients for better text visibility if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default CarImageCarousel;