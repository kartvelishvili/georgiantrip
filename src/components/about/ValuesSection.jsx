import React from 'react';
import { Heart, Star, Leaf, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const ICON_MAP = [Heart, Shield, Star, Leaf];

const ValueCard = ({ icon: Icon, title, description, image, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-100"
  >
     <div className="h-48 overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
     </div>
     <div className="p-6 flex-grow bg-white">
        <p className="text-gray-600 leading-relaxed">
           {description}
        </p>
     </div>
  </motion.div>
);

const ValuesSection = () => {
  const { content } = useSiteContent('about', 'values', DEFAULT_CONTENT.about.values);

  const values = (content.items || []).map((item, i) => ({
    icon: ICON_MAP[i % ICON_MAP.length],
    title: item.title,
    description: item.description,
    image: item.imageUrl ? `${item.imageUrl}?auto=format&fit=crop&q=80&w=500` : '',
  }));

  return (
    <section className="py-24 bg-gray-50">
       <div className="container-custom">
          <div className="text-center mb-16 max-w-3xl mx-auto">
             <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">{content.label}</span>
             <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">{content.title}</h2>
             <p className="text-gray-500 text-lg leading-relaxed">
                {content.subtitle}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {values.map((value, index) => (
                <ValueCard key={index} {...value} index={index} />
             ))}
          </div>
       </div>
    </section>
  );
};

export default ValuesSection;