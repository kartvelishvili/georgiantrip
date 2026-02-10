import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const HeroSection = () => {
  const { content } = useSiteContent('about', 'hero', DEFAULT_CONTENT.about.hero);

  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
           src={`${content.backgroundImage}?auto=format&fit=crop&q=80&w=1920`}
           alt="Panoramic view of Caucasus Mountains and Trinity Church" 
           className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 text-center text-white px-4">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-6 font-medium">
             <Link to="/" className="hover:text-white transition-colors">Home</Link>
             <ChevronRight className="w-3 h-3" />
             <span className="text-green-400">About Us</span>
          </div>

          {/* Pill Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-4 tracking-wide border border-white/20">
            <Info className="w-4 h-4" />
            Get to Know Us
          </span>

          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight drop-shadow-lg">
            {content.title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto font-light leading-relaxed mb-8 drop-shadow-md">
            {content.subtitle}
          </p>

          <Link 
            to="#our-story" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-300 bg-green-600 border border-transparent rounded-full hover:bg-green-700 hover:shadow-lg hover:shadow-green-900/40 hover:-translate-y-1"
          >
            {content.ctaText || 'Discover Our Mission'}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;