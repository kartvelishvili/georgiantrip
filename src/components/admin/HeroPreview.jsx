import React from 'react';
import HeroSearch from '@/components/customer/HeroSearch';
import { motion } from 'framer-motion';

const HeroPreview = ({ settings, activeLanguage = 'en' }) => {
  // Helper to get text based on language
  const getLocalizedText = (field) => {
    if (!settings) return '';
    return settings[`${field}_${activeLanguage}`] || settings[`${field}_en`] || '';
  };

  const title = getLocalizedText('title');
  const subtitle = getLocalizedText('subtitle');
  const imageUrl = settings?.image_url || 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=2000&auto=format&fit=crop';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md bg-white">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <span className="font-semibold text-sm text-gray-700">Live Preview ({activeLanguage.toUpperCase()})</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden group">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={imageUrl} 
            alt="Hero Background Preview" 
            className="w-full h-full object-cover transition-transform duration-700"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 w-full px-8 py-12 flex flex-col items-center">
          <div className="max-w-2xl text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="text-lg text-gray-100 font-light leading-relaxed drop-shadow-md">
              {subtitle}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 w-full max-w-3xl border border-white/20 transform scale-90 md:scale-100 origin-top">
             <div className="text-center text-gray-400 py-4 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                [Search Component Placeholder]
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroPreview;