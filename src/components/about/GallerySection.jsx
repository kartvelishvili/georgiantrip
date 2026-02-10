import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Camera } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const GALLERY_SPANS = [
  'col-span-1 md:col-span-2 row-span-2',
  'col-span-1',
  'col-span-1',
  'col-span-1',
  'col-span-1',
];

const GallerySection = () => {
  const { content } = useSiteContent('about', 'gallery', DEFAULT_CONTENT.about.gallery);

  const images = (content.images || []).map((img, i) => ({
    src: img.url ? `${img.url}?auto=format&fit=crop&q=80&w=${i === 0 ? 600 : 400}` : '',
    alt: img.alt || '',
    span: GALLERY_SPANS[i % GALLERY_SPANS.length],
  }));

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
           <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
             <Camera className="w-4 h-4" />
             {content.label}
           </span>
           <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">{content.title}</h2>
           <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {content.subtitle}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
           {images.map((img, index) => (
             <motion.div 
               key={index}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className={`relative rounded-2xl overflow-hidden group shadow-md ${img.span}`}
             >
                <img 
                   src={img.src} 
                   alt={img.alt} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.alt}</p>
                </div>
             </motion.div>
           ))}
        </div>
        
        <div className="mt-12 text-center">
           <a href={content.instagramUrl || 'https://www.instagram.com/georgiantrip_go/'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition-colors">
              <Instagram className="w-5 h-5" />
              View more on Instagram
           </a>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;