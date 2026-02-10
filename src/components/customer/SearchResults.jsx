import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { calculateDistance, calculatePrice } from '@/lib/pricing';
import HeroSearch from '@/components/customer/HeroSearch';
import CarCard from '@/components/customer/CarCard';
import BookingForm from '@/components/customer/BookingForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HowToOrder from '@/components/customer/HowToOrder';
import PopularDestinationsLinks from '@/components/customer/PopularDestinationsLinks';
import ReviewsSection from '@/components/customer/ReviewsSection';
import FAQAccordion from '@/components/customer/FAQAccordion';
import SEOTextBlock from '@/components/customer/SEOTextBlock';

const SearchResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [distance, setDistance] = useState(0);
  const [routeDetails, setRouteDetails] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchParams, setSearchParams] = useState(state?.searchData || null);

  useEffect(() => {
    if (searchParams) {
      performSearch(searchParams);
    }
  }, [searchParams]);

  const performSearch = async (params) => {
    setLoading(true);
    setSelectedCar(null); // Reset selection on new search

    try {
      // 1. Get Location Details
      const { data: locations } = await supabase
        .from('locations')
        .select('*')
        .in('id', [params.startLocation, params.endLocation]);
        
      const startLoc = locations?.find(l => l.id === params.startLocation);
      const endLoc = locations?.find(l => l.id === params.endLocation);
      
      if (!startLoc || !endLoc) throw new Error("Invalid locations");

      setRouteDetails({ start: startLoc, end: endLoc });

      // 1.5 Get Global Pricing Settings
      const { data: settingsData } = await supabase
        .from('admin_settings')
        .select('*')
        .maybeSingle();

      // 2. Calculate Distance
      const dist = await calculateDistance(startLoc, endLoc);
      setDistance(dist);

      // 3. Get Active Cars & Drivers with Pricing
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select(`
          *,
          drivers!inner(
            *,
            driver_pricing(*)
          )
        `)
        .eq('active', true)
        .eq('verification_status', 'approved');

      if (carsError) throw carsError;

      // 4. Calculate Prices & Filter
      const processedResults = (cars || []).map(car => {
        const driverPricing = car.drivers?.driver_pricing;
        const price = calculatePrice(dist, settingsData, driverPricing);
        return { car, driver: car.drivers, price };
      }).sort((a, b) => a.price - b.price); // Sort by price asc

      setResults(processedResults);

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    // Navigate to success page or show modal
    navigate('/');
  };

  if (!searchParams) {
    return <div className="text-center py-20">No search parameters. <Button onClick={() => navigate('/')}>Go Home</Button></div>;
  }

  // Booking Flow View
  if (selectedCar) {
     return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-8">
           <div className="container-custom max-w-4xl">
              <Button variant="ghost" onClick={() => setSelectedCar(null)} className="mb-6 pl-0 hover:bg-transparent hover:text-green-600">
                 <ArrowLeft className="w-4 h-4 mr-2" /> Back to results
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="md:col-span-2">
                    <BookingForm 
                       car={{ ...selectedCar.car, calculatedPrice: selectedCar.price }} 
                       searchData={searchParams}
                       distance={distance}
                       onBack={() => setSelectedCar(null)}
                    />
                 </div>
                 <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">Trip Summary</h3>
                        <div className="space-y-4 text-sm">
                           <div>
                              <div className="text-gray-500 text-xs uppercase font-bold">From</div>
                              <div className="font-medium">{routeDetails?.start?.name_en}</div>
                           </div>
                           <div>
                              <div className="text-gray-500 text-xs uppercase font-bold">To</div>
                              <div className="font-medium">{routeDetails?.end?.name_en}</div>
                           </div>
                           <div className="flex justify-between border-t pt-3 mt-2">
                              <span>Distance</span>
                              <span className="font-mono text-gray-500">{distance} km</span>
                           </div>
                           <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg mt-2">
                              <span className="font-bold text-green-800">Total Price</span>
                              <span className="font-bold text-green-700 text-xl">{selectedCar.price} ₾</span>
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  // Results View
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container-custom py-4">
           <HeroSearch compact onSearch={setSearchParams} initialData={searchParams} />
        </div>
      </div>
      
      <div className="flex-grow py-8">
        <div className="container-custom">
           <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                 {routeDetails ? `Transfer from ${routeDetails.start.name_en} to ${routeDetails.end.name_en}` : 'Search Results'}
              </h1>
              <span className="text-gray-500 text-sm hidden md:inline-block">
                 {results.length} vehicles available • {distance} km
              </span>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
               <p>Finding the best drivers for you...</p>
             </div>
           ) : results.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
               <h3 className="text-xl font-bold text-gray-900 mb-2">No cars available</h3>
               <p className="text-gray-500 mb-6">Try changing your dates or vehicle preferences.</p>
               <Button onClick={() => window.location.reload()}>Refresh Page</Button>
             </div>
           ) : (
             <div className="space-y-4">
               {results.map((item) => (
                 <CarCard 
                   key={item.car.id} 
                   car={item.car} 
                   driver={item.driver} 
                   price={item.price} 
                   onSelect={(c, d, p) => setSelectedCar({ car: c, driver: d, price: p })} 
                 />
               ))}
             </div>
           )}
        </div>
      </div>

      <HowToOrder />
      <ReviewsSection />
      <FAQAccordion />
      <PopularDestinationsLinks />
      <SEOTextBlock from={routeDetails?.start?.name_en} to={routeDetails?.end?.name_en} />
    </div>
  );
};

export default SearchResults;