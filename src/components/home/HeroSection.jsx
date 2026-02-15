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
          className="w-full h-full object-cover scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#064E3B]/70 via-black/40 to-[#064E3B]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 container-custom pt-32 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 backdrop-blur-md text-white rounded-full text-sm font-bold mb-6 tracking-wide border border-white/20">
              <MapPin className="w-4 h-4" />
              #1 Travel Platform in Georgia
            </span>
          </motion.div>
          <motion.h1 
            key={title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          >
            {title}
          </motion.h1>
          <motion.p 
            key={subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-white/85 mb-8 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm"
          >
            {subtitle}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 md:p-8 max-w-5xl mx-auto border border-white/60 relative z-20 ring-1 ring-white/20"
        >
          <HeroSearch />
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;