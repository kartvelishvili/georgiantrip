import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TourGallery = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] overflow-hidden rounded-3xl">
        {/* Main large image */}
        <div 
            className="md:col-span-2 md:row-span-2 h-full cursor-pointer relative group overflow-hidden"
            onClick={() => openLightbox(0)}
        >
            <img src={images[0]} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        </div>
        
        {/* Secondary images */}
        <div className="hidden md:grid grid-cols-2 col-span-2 row-span-2 gap-2 h-full">
           {images.slice(1, 5).map((img, idx) => (
             <div 
                key={idx} 
                className="cursor-pointer relative group overflow-hidden h-full"
                onClick={() => openLightbox(idx + 1)}
             >
                <img src={img} alt={`Gallery ${idx + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {idx === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm group-hover:bg-black/40 transition-colors">
                        +{images.length - 5}
                    </div>
                )}
             </div>
           ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black border-none flex items-center justify-center overflow-hidden">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-50">
                <X className="w-8 h-8" />
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
                <img 
                    src={images[currentIndex]} 
                    alt="Full screen" 
                    className="max-w-full max-h-full object-contain"
                />
                
                <Button 
                    variant="ghost" 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full p-0"
                    onClick={prevImage}
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>

                <Button 
                    variant="ghost" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full p-0"
                    onClick={nextImage}
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-medium">
                {currentIndex + 1} / {images.length}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourGallery;