import React, { useState, useEffect } from 'react';
import { getPopularTransfers } from '@/lib/transferService';
import { ArrowRight, Loader2, Navigation } from 'lucide-react';
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
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.04),transparent_50%)]" />
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
           <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
             <Navigation className="w-4 h-4" />
             Private Transfers
           </span>
           <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
             Popular Routes
           </h2>
           <p className="text-gray-600 text-lg">
             Explore our most booked private transfer destinations across Georgia
           </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {transfers.map((transfer) => (
             <TransferCard key={transfer.id} transfer={transfer} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link to="/transfers">
            <Button 
               variant="outline" 
               className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 gap-2 px-8 py-6 text-base font-semibold rounded-full transition-all duration-300 hover:shadow-md"
            >
               View All Destinations <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularTransfersSection;