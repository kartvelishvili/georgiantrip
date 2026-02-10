import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTourById } from '@/lib/tourService';
import TourGallery from '@/components/tour/TourGallery';
import TourItinerary from '@/components/tour/TourItinerary';
import TourReviews from '@/components/tour/TourReviews';
import TourBookingForm from '@/components/tour/TourBookingForm';
import { CheckCircle2, Clock, Calendar, ArrowDown, ChevronRight, Star, MapPin } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { formatPriceDetail } from '@/lib/currencyUtils';
import { motion } from 'framer-motion';

const TourDetailPage = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const data = await getTourById(tourId);
        setTour(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [tourId]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>;
  if (!tour) return <div className="h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 text-lg">Tour not found</p></div>;

  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayImage = tour.gallery_images?.[0] || tour.image_url || 'https://images.unsplash.com/photo-1589792923962-537704632910?w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Dark Hero Header */}
      <div className="relative h-[420px] overflow-hidden">
        <img src={displayImage} alt={tour.name_en} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/50 to-gray-950/30" />
        
        <div className="absolute inset-0 flex flex-col justify-end z-10">
          <motion.div 
            className="container-custom pb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-400 mb-4">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link to="/tours" className="hover:text-white transition-colors">Tours</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{tour.name_en}</span>
            </nav>
            
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">{tour.name_en}</h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                <Clock className="w-4 h-4 text-green-400" />
                {tour.duration_days} Days
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                <Calendar className="w-4 h-4 text-green-400" />
                Available Daily
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {tour.rating} ({tour.reviews_count} reviews)
              </span>
              <span className="inline-flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm text-green-300 px-4 py-1.5 rounded-full text-sm font-bold border border-green-400/30">
                {formatPriceDetail(tour.price_per_person)} / person
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Left Content */}
           <div className="lg:col-span-2 space-y-10">
              <TourGallery images={tour.gallery_images} />

              {/* Mobile Booking CTA */}
              <div className="lg:hidden">
                  <button onClick={scrollToBooking} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all">
                      Book Now <ArrowDown className="w-4 h-4" />
                  </button>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                 <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">About this tour</h3>
                 <p className="text-gray-600 leading-relaxed whitespace-pre-line">{tour.description_en}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-5">What's included</h3>
                    <ul className="space-y-3">
                       {tour.what_included?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                             <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-5">What to bring</h3>
                    <ul className="space-y-3">
                       {tour.what_to_bring?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                             <span className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0"></span>
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <TourItinerary itinerary={tour.itinerary} />
              
              <TourReviews rating={tour.rating} count={tour.reviews_count} />
           </div>

           {/* Right Sidebar - Sticky Booking Form */}
           <div className="lg:col-span-1" id="booking-form">
              <div className="sticky top-24">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Book This Tour</h3>
                    <TourBookingForm tour={tour} />
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;