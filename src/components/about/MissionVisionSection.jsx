import React from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const MissionVisionSection = () => {
  const { content: mission } = useSiteContent('about', 'mission', DEFAULT_CONTENT.about.mission);
  const { content: vision } = useSiteContent('about', 'vision', DEFAULT_CONTENT.about.vision);

  return (
    <section className="py-0 bg-white">
      {/* Mission Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 order-2 md:order-1">
               <motion.div 
                 className="relative rounded-3xl overflow-hidden shadow-2xl"
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                  <img 
                    src={`${mission.imageUrl}?auto=format&fit=crop&q=80&w=800`}
                    alt={mission.title} 
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                     <p className="text-white font-medium italic">"{mission.imageCaption}"</p>
                  </div>
               </motion.div>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                 <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">{mission.label}</span>
                 <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">{mission.title}</h2>
                 <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {mission.paragraphs?.[0]}
                 </p>
                 <p className="text-gray-600 text-lg leading-relaxed">
                    {mission.paragraphs?.[1]}
                 </p>
               </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="relative py-24 bg-gray-50 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
               <motion.div
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                 <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">{vision.label}</span>
                 <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">{vision.title}</h2>
                 <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {vision.paragraphs?.[0]}
                 </p>
                 <p className="text-gray-600 text-lg leading-relaxed">
                    {vision.paragraphs?.[1]}
                 </p>
               </motion.div>
            </div>
            <div className="w-full md:w-1/2">
               <motion.div 
                 className="relative rounded-3xl overflow-hidden shadow-2xl"
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                  <img 
                    src={`${vision.imageUrl}?auto=format&fit=crop&q=80&w=800`}
                    alt={vision.title} 
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                     <p className="text-white font-medium italic">"{vision.imageCaption}"</p>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;