import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const featureIcons = [Heart, Shield];

const OurStorySection = () => {
  const navigate = useNavigate();
  const { content } = useSiteContent('home', 'our_story', DEFAULT_CONTENT.home.our_story);
  const images = content.images || [];
  const features = content.features || [];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Text Content */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
                {content.label}
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6 leading-tight">
                {content.title}
              </h2>
              
              <div className="space-y-5 text-lg text-gray-600 leading-relaxed font-body">
                {(content.paragraphs || []).map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 mb-10">
                {features.map((feat, i) => {
                  const Icon = featureIcons[i] || Heart;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-green-50/50 transition-colors">
                      <div className="p-3 bg-green-100 rounded-xl text-green-600 shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1">{feat.title}</h5>
                        <p className="text-sm text-gray-500">{feat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={() => navigate('/about')}
                className="bg-green-700 text-white hover:bg-green-600 h-12 px-8 rounded-full text-lg font-medium group transition-all shadow-lg shadow-green-700/20"
              >
                {content.buttonText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Image Grid */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="space-y-4 mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {images.slice(0, 2).map((img, i) => (
                  <div key={i} className={`${i === 0 ? 'h-64' : 'h-48'} rounded-2xl overflow-hidden shadow-lg relative group`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-500 z-10" />
                    <img className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="Georgia" src={img} />
                  </div>
                ))}
              </motion.div>
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {images.slice(2, 4).map((img, i) => (
                  <div key={i} className={`${i === 0 ? 'h-48' : 'h-64'} rounded-2xl overflow-hidden shadow-lg relative group`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-500 z-10" />
                    <img className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt="Georgia" src={img} />
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-50/50 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;