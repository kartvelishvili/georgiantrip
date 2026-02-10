import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const OurStorySection = () => {
  return (
    <section id="our-story" className="py-24 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
           {/* Text Content */}
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
           >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
                <BookOpen className="w-4 h-4" />
                Our Journey
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
                 Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                 <p>
                    GeorgianTrip started in 2015 with a simple mission: to show the world the true heart of the Caucasus. What began as a small family-owned business offering local transfers has grown into Georgia's premier travel partner.
                 </p>
                 <p>
                    We believe that travel isn't just about moving from point A to point B—it's about the stories, the people, and the unforgettable moments along the way. Our founders, born and raised in Tbilisi, wanted to share the warm hospitality ("Gastepinbloba") that Georgia is famous for.
                 </p>
                 <p>
                    Today, we are proud to have hosted over 10,000 travelers from around the globe, helping them discover hidden gems, taste authentic flavors, and create memories that last a lifetime.
                 </p>
              </div>

              {/* Milestones */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-100 pt-8">
                 <div>
                    <span className="block text-3xl font-bold text-green-600 mb-1">2015</span>
                    <span className="text-sm text-gray-500 font-medium">Founded in Tbilisi</span>
                 </div>
                 <div>
                    <span className="block text-3xl font-bold text-green-600 mb-1">2018</span>
                    <span className="text-sm text-gray-500 font-medium">Expanded Nationwide</span>
                 </div>
                 <div>
                    <span className="block text-3xl font-bold text-green-600 mb-1">10k+</span>
                    <span className="text-sm text-gray-500 font-medium">Happy Travelers</span>
                 </div>
              </div>
           </motion.div>

           {/* Image Grid */}
           <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
           >
              <div className="space-y-4 mt-8">
                 <div className="h-48 rounded-2xl overflow-hidden shadow-md group">
                    <img 
                       src="https://images.unsplash.com/photo-1574236170880-640fb0855277?auto=format&fit=crop&q=80&w=400" 
                       alt="Old Tbilisi Streets" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                 </div>
                 <div className="h-64 rounded-2xl overflow-hidden shadow-md group">
                    <img 
                       src="https://images.unsplash.com/photo-1541300613939-71366b37c92e?auto=format&fit=crop&q=80&w=400" 
                       alt="Georgian Wine" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="h-64 rounded-2xl overflow-hidden shadow-md group">
                    <img 
                       src="https://images.unsplash.com/photo-1473676766723-1d6eb758a5fc?auto=format&fit=crop&q=80&w=400" 
                       alt="Hiking in Kazbegi" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                 </div>
                 <div className="h-48 rounded-2xl overflow-hidden shadow-md group">
                    <img 
                       src="https://images.unsplash.com/photo-1589828949826-6f10137452d3?auto=format&fit=crop&q=80&w=400" 
                       alt="Our Transport Fleet" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;