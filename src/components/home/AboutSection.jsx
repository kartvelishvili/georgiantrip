import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Car, Map, Headphones, ArrowRight, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const StatItem = ({ value, label, icon: Icon }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-green-600" />
    </div>
    <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

const AboutSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden" id="about">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 relative z-10"
          >
            <div>
                <span className="text-green-600 font-bold tracking-widest text-sm uppercase mb-3 block">Our Story</span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-tight mb-6">
                  Discover Georgia with <span className="text-green-600">GeorgianTrip</span>
                </h2>
                <p className="text-xl text-gray-500 font-light leading-relaxed mb-6">
                   Your trusted partner for unforgettable Georgian adventures. We connect you with the heart of the Caucasus through authentic experiences.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Since 2015, we've been crafting journeys that go beyond the ordinary. From the ancient streets of Tbilisi to the high peaks of Kazbegi, our mission is to provide safe, comfortable, and deeply personal travel experiences.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-t border-b border-gray-100">
                <StatItem value="2015" label="Founded" icon={Calendar} />
                <StatItem value="10k+" label="Happy Travelers" icon={Users} />
                <StatItem value="50+" label="Unique Tours" icon={Map} />
                <StatItem value="#1" label="Travel Choice" icon={Award} />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/about">
                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-green-200 transition-transform hover:scale-105">
                        Read Our Full Story <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
                <Link to="/contact">
                    <Button variant="outline" className="rounded-full px-8 h-12 text-base border-gray-200 hover:bg-gray-50 hover:text-green-600">
                        Contact Us
                    </Button>
                </Link>
            </div>
          </motion.div>

          {/* Right Column: Image Gallery */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative"
          >
             {/* Abstract Background Shapes */}
             <div className="absolute -inset-4 bg-gradient-to-tr from-green-50 to-blue-50 rounded-[40px] transform rotate-3 -z-10 opacity-70"></div>
             
             <div className="grid grid-cols-2 gap-4">
                {/* Main Large Image */}
                <div className="col-span-2 relative h-64 rounded-2xl overflow-hidden group shadow-lg">
                   <img 
                     src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=800" 
                     alt="Svaneti Landscape" 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                   <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">Breathtaking Landscapes</p>
                      <p className="text-xs text-gray-200">Explore the Caucasus Mountains</p>
                   </div>
                </div>

                {/* Secondary Images */}
                <div className="col-span-1 relative h-48 rounded-2xl overflow-hidden group shadow-lg">
                   <img 
                     src="https://images.unsplash.com/photo-1539656209581-2292f2939945?auto=format&fit=crop&q=80&w=400" 
                     alt="Georgian Food" 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                   <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-bold text-sm">Local Cuisine</p>
                   </div>
                </div>

                <div className="col-span-1 relative h-48 rounded-2xl overflow-hidden group shadow-lg">
                   <img 
                     src="https://images.unsplash.com/photo-1589828949826-6f10137452d3?auto=format&fit=crop&q=80&w=400" 
                     alt="Modern Transport" 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                   <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-bold text-sm">Comfort Travel</p>
                   </div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow hidden md:flex">
                <div className="bg-yellow-100 p-2 rounded-full">
                   <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase">Rated</p>
                   <p className="font-bold text-gray-900">5.0/5.0 Stars</p>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;