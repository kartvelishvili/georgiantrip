import React, { useState, useEffect } from 'react';
import HeroSearch from '@/components/customer/HeroSearch';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getHeroSettings } from '@/lib/heroService';
import { MapPin } from 'lucide-react';

const HeroSection = () => {
  const { t, currentLanguage } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getHeroSettings();
        if (data) setSettings(data);
      } catch (error) {
        console.error("Failed to load hero settings", error);
      }
    };
    fetchSettings();
  }, []);

  const getLocalizedContent = (field) => {
    if (!settings) return null;
    return settings[`${field}_${currentLanguage}`] || settings[`${field}_en`];
  };

  const title = getLocalizedContent('title') || t('heroTitle');
  const subtitle = getLocalizedContent('subtitle') || t('heroSubtitle');
  const bgImage = settings?.image_url || "https://i.postimg.cc/nrbYszvV/179254820-super.jpg";

  return (
    <div className="relative min-h-[780px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Hero Background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/50 to-white/70" />
      </div>

      <div className="relative z-10 container-custom pt-32 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100/80 backdrop-blur-sm text-green-800 rounded-full text-sm font-bold mb-6 tracking-wide">
              <MapPin className="w-4 h-4" />
              #1 Travel Platform in Georgia
            </span>
          </motion.div>
          <motion.h1 
            key={title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-green-950 mb-6 tracking-tight drop-shadow-sm"
          >
            {title}
          </motion.h1>
          <motion.p 
            key={subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-800 mb-8 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm"
          >
            {subtitle}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto border border-white/60 relative z-20 ring-1 ring-black/5"
        >
          <HeroSearch />
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;