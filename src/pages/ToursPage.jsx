import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import TourCard from '@/components/home/TourCard';
import { Loader2, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { content } = useSiteContent('pages', 'tours', DEFAULT_CONTENT.pages.tours);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };

    fetchTours();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-gray-950 text-white py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-gray-950 to-blue-900/20 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.1),transparent_60%)]" />
        <motion.div 
          className="container-custom relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-4 tracking-wide border border-white/20">
            <Compass className="w-4 h-4" />
            Explore Georgia
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{content.title || t('tours')}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {content.subtitle || "Discover the beauty of Georgia with our curated selection of tours."}
          </p>
        </motion.div>
      </div>

      <div className="container-custom pt-12">
        {loading ? (
           <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 animate-spin text-green-600" />
           </div>
        ) : tours.length === 0 ? (
           <div className="text-center py-20 text-gray-500">No tours available at the moment.</div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
           </div>
        )}
      </div>
    </div>
  );
};

export default ToursPage;