import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import TourCard from '@/components/home/TourCard';
import { Loader2, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PopularToursSection = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        let { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('display_order', { ascending: true })
          .limit(4);

        if (!data || data.length === 0) {
            const { data: fallbackData } = await supabase
                .from('tours')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
                .limit(4);
            data = fallbackData;
        }

        if (error && !data) throw error;
        setTours(data || []);
      } catch (err) {
        console.error('Error fetching tours:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.04),transparent_50%)]" />
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
              <Compass className="w-4 h-4" />
              Discover Georgia
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Popular Tours</h2>
            <p className="text-gray-600 text-lg">
              Explore our most requested destinations. Hand-picked adventures across Georgia.
            </p>
          </motion.div>
          <Link to="/tours">
            <Button variant="outline" className="hidden md:flex border-green-600 text-green-700 hover:bg-green-50 rounded-full gap-2 px-6 h-11">
              View All Tours <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No tours available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
        
        <div className="mt-10 md:hidden text-center">
           <Link to="/tours">
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 w-full rounded-full gap-2">
              View All Tours <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularToursSection;