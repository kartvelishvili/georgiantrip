import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTourById } from '@/lib/tourService';
import TourGallery from '@/components/tour/TourGallery';
import TourItinerary from '@/components/tour/TourItinerary';
import TourReviews from '@/components/tour/TourReviews';
import TourBookingForm from '@/components/tour/TourBookingForm';
import { CheckCircle2, Clock, Calendar, ArrowDown } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { formatPriceDetail } from '@/lib/currencyUtils';

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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>;
  if (!tour) return <div className="h-screen flex items-center justify-center">Tour not found</div>;

  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
           {/* Left Content */}
           <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                 <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">{tour.name_en}</h1>
                 
                 <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                       <Clock className="w-4 h-4 text-green-600" />
                       <span className="font-medium">{tour.duration_days} Days</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                       <Calendar className="w-4 h-4 text-green-600" />
                       <span className="font-medium">Available Daily</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="text-yellow-500 font-bold">★ {tour.rating}</span>
                       <span className="text-gray-400">({tour.reviews_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                       <span className="text-green-700 font-bold">{formatPriceDetail(tour.price_per_person)} / person</span>
                    </div>
                 </div>
              </div>

              <TourGallery images={tour.gallery_images} />

              {/* Mobile Booking CTA */}
              <div className="lg:hidden">
                  <button onClick={scrollToBooking} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                      Book Now <ArrowDown className="w-4 h-4" />
                  </button>
              </div>

              <div className="prose max-w-none text-gray-600 leading-relaxed">
                 <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">About this tour</h3>
                 <p className="whitespace-pre-line">{tour.description_en}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4">What's included</h3>
                    <ul className="space-y-3">
                       {tour.what_included?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                             <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4">What to bring</h3>
                    <ul className="space-y-3">
                       {tour.what_to_bring?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                             <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></span>
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
           <div className="lg:col-span-1">
              <div className="sticky top-24">
                  <h3 className="text-xl font-bold mb-4">Book This Tour</h3>
                  <TourBookingForm tour={tour} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;