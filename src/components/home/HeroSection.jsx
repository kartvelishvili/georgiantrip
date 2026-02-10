import React, { useState, useEffect } from 'react';
import HeroSearch from '@/components/customer/HeroSearch';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getHeroSettings } from '@/lib/heroService';
import { MapPin, Star, Shield, Clock } from 'lucide-react';

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

  const trustBadges = [
    { icon: Star, text: '4.9 Rating' },
    { icon: Shield, text: 'Fixed Prices' },
    { icon: Clock, text: '24/7 Service' },
  ];

  return (
    <div className="relative min-h-[850px] flex items-center justify-center overflow-hidden">
      {/* Background Image with dark cinematic overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Hero Background" 
          className="w-full h-full object-cover scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/50 to-gray-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 via-transparent to-gray-950/40" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl z-0" />

      <div className="relative z-10 container-custom pt-36 pb-28">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-bold mb-8 tracking-wide border border-white/20 shadow-lg shadow-black/10">
              <MapPin className="w-4 h-4 text-green-400" />
              #1 Travel Platform in Georgia
            </span>
          </motion.div>
          <motion.h1 
            key={title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 tracking-tight leading-[1.1]"
          >
            {title}
          </motion.h1>
          <motion.p 
            key={subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-6"
          >
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <badge.icon className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="bg-white/[0.07] backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto border border-white/10 relative z-20"
        >
          <HeroSearch />
        </motion.div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-10" />
    </div>
  );
};

export default HeroSection;