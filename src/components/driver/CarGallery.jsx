import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CarGallery = ({ images, mainImage, title }) => {
  // Combine main image with gallery images for a full list
  const allImages = [mainImage, ...(images || [])].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
        <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
        <span className="text-sm">No images available</span>
      </div>
    );
  }

  const handlePrevious = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden group shadow-md">
        <img 
          src={allImages[selectedIndex]} 
          alt={`${title} - View ${selectedIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Overlays */}
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          {selectedIndex + 1} / {allImages.length}
        </div>

        {/* Navigation Controls */}
        {allImages.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                selectedIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarGallery;