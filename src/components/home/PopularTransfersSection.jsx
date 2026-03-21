import React, { useState, useEffect } from 'react';
import { getPopularTransfers } from '@/lib/transferService';
import { ArrowRight, Loader2, Navigation, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TransferCard from '@/components/home/TransferCard';
import { motion } from 'framer-motion';

const PopularTransfersSection = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const data = await getPopularTransfers();
        setTransfers(data || []);
      } catch (error) {
        console.error("Failed to load transfers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  if (loading) {
     return <div className="py-20 flex justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>;
  }
  
  if (transfers.length === 0) return null;

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/40 to-white" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
           <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-sm font-bold mb-5 tracking-wide border border-emerald-100/80 shadow-sm">
             <Navigation className="w-4 h-4" />
             Private Transfers
             <Sparkles className="w-3.5 h-3.5 text-amber-500" />
           </span>
           <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 mb-5 tracking-tight">
             Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Routes</span>
           </h2>
           <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
             Explore our most booked private transfer destinations across Georgia
           </p>
        </motion.div>

        {/* Grid Layout */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
        >
          {transfers.map((transfer, index) => (
             <motion.div
               key={transfer.id}
               variants={{
                 hidden: { opacity: 0, y: 30 },
                 visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
               }}
             >
               <TransferCard transfer={transfer} />
             </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div 
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/transfers">
            <Button 
               className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white gap-2.5 px-10 py-6 text-base font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-green-600/20 hover:-translate-y-0.5"
            >
               View All Destinations <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularTransfersSection;