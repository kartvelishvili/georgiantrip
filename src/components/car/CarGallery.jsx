import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CarGallery = ({ images = [] }) => {
  const [mainImage, setMainImage] = useState(images[0] || '');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure we have valid images
  const safeImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'];

  const handleThumbnailClick = (img, index) => {
    setMainImage(img);
    setCurrentIndex(index);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % safeImages.length;
    setMainImage(safeImages[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + safeImages.length) % safeImages.length;
    setMainImage(safeImages[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 group cursor-pointer"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img 
          src={mainImage} 
          alt="Car Main" 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
           <Maximize2 className="w-4 h-4" />
           {currentIndex + 1}/{safeImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => handleThumbnailClick(img, idx)}
            className={cn(
              "relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all",
              mainImage === img ? "ring-2 ring-green-600 ring-offset-2" : "opacity-70 hover:opacity-100"
            )}
          >
            <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-12 w-12"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
             variant="ghost"
             size="icon"
             className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 hidden md:flex"
             onClick={handlePrev}
          >
             <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
             variant="ghost"
             size="icon"
             className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 hidden md:flex"
             onClick={handleNext}
          >
             <ChevronRight className="w-8 h-8" />
          </Button>
          
          <div className="max-w-7xl max-h-[85vh] w-full">
             <img 
               src={mainImage} 
               alt="Full Screen" 
               className="h-full w-full object-contain mx-auto"
             />
             <p className="text-center text-white mt-4 font-mono">
               {currentIndex + 1} / {safeImages.length}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarGallery;