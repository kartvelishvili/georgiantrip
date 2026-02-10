import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, RefreshCw, Info } from 'lucide-react';
import HeroSearch from '@/components/customer/HeroSearch';
import CarResultCard from '@/components/search/CarResultCard';
import BookingModal from '@/components/booking/BookingModal';
import { calculateDistance } from '@/lib/distanceCalculator';
import { calculateTripPrice } from '@/lib/pricing';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState(null);
  const [cars, setCars] = useState([]);
  
  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const fromId = params.get('from');
      const toId = params.get('to');
      const date = params.get('date') || new Date().toISOString().split('T')[0];
      const stopsIds = params.get('stops') ? params.get('stops').split(',') : [];

      if (!fromId || !toId) {
        setLoading(false);
        return;
      }

      try {
        const locationIds = [fromId, toId, ...stopsIds];
        const [{ data: locationsData, error: locError }, { data: adminSettings }] = await Promise.all([
          supabase.from('locations').select('*').in('id', locationIds),
          supabase.from('admin_settings').select('*').maybeSingle()
        ]);

        if (locError) throw locError;

        const fromLocation = locationsData.find(l => l.id === fromId);
        const toLocation = locationsData.find(l => l.id === toId);
        const stopLocations = stopsIds.map(id => locationsData.find(l => l.id === id)).filter(Boolean);

        if (!fromLocation || !toLocation) {
            setLoading(false);
            return;
        }

        let totalDistance = 0;
        let totalDuration = 0;

        const routePoints = [fromLocation, ...stopLocations, toLocation];
        
        for (let i = 0; i < routePoints.length - 1; i++) {
             const start = routePoints[i];
             const end = routePoints[i+1];
             if (start.lat && start.lng && end.lat && end.lng) {
                 const dist = calculateDistance(start.lat, start.lng, end.lat, end.lng);
                 totalDistance += dist;
             }
        }
        
        totalDuration = (totalDistance / 60) * 60 + (stopsIds.length * 10); 

        const { data: availableCars, error: carError } = await supabase
          .from('cars')
          .select(`
            *,
            drivers (*, driver_pricing(*))
          `)
          .eq('active', true)
          .eq('verification_status', 'approved');
          
        if (carError) throw carError;

        // Map admin_settings to the format calculateTripPrice expects
        const globalSettings = adminSettings ? {
          base_rate_per_km: adminSettings.base_rate_per_km,
          multiplier_0_50km: adminSettings.multiplier_0_50km,
          multiplier_50_100km: adminSettings.multiplier_50_100km,
          multiplier_100_200km: adminSettings.multiplier_100_200km,
          multiplier_200_plus_km: adminSettings.multiplier_200_plus_km,
          min_fare: adminSettings.min_fare,
          driver_price_override_enabled: adminSettings.driver_price_override_enabled ?? true,
          max_price_per_km: adminSettings.max_price_per_km ?? 5.0
        } : null;

        const carsWithPrices = availableCars.map(car => {
             const driverPricing = car.drivers?.driver_pricing || null;
             const price = calculateTripPrice(totalDistance, globalSettings, driverPricing); 
             return {
                 ...car,
                 calculatedPrice: price,
                 price: price
             };
        });

        setTripDetails({
            from: fromLocation,
            to: toLocation,
            stops: stopLocations,
            date: date,
            distance: Math.round(totalDistance),
            duration: Math.round(totalDuration)
        });
        
        setCars(carsWithPrices);

      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [location.search]);

  const handleBook = (car) => {
    setSelectedCar(car);
    setIsBookingModalOpen(true);
  };

  const modalSearchParams = tripDetails ? {
      startLocation: { 
          id: tripDetails.from.id, 
          name: tripDetails.from.name_en,
          lat: tripDetails.from.lat,
          lng: tripDetails.from.lng
      },
      endLocation: { 
          id: tripDetails.to.id, 
          name: tripDetails.to.name_en,
          lat: tripDetails.to.lat,
          lng: tripDetails.to.lng
      },
      stops: tripDetails.stops.map(s => ({
          id: s.id, 
          name: s.name_en,
          lat: s.lat,
          lng: s.lng
      })),
      date: tripDetails.date,
      distance: tripDetails.distance,
      duration: `${Math.floor(tripDetails.duration / 60)}h ${tripDetails.duration % 60}m`
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>Search Results | GeorgianTrip</title>
      </Helmet>
      
      {/* Search Bar — sits below the fixed site Header */}
      <div className="bg-gray-950 pt-24 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-950 to-gray-950 z-0" />
         <div className="container-custom relative z-10">
             <div className="flex flex-col md:flex-row items-center gap-3">
                 <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0 hidden md:flex text-gray-400 hover:text-white hover:bg-white/10">
                     <ArrowLeft className="w-4 h-4 mr-2" /> Back
                 </Button>
                 
                 <div className="w-full">
                     {tripDetails && (
                        <HeroSearch 
                           compact={true} 
                           initialData={{
                               startLocation: { id: tripDetails.from.id, name: tripDetails.from.name_en },
                               endLocation: { id: tripDetails.to.id, name: tripDetails.to.name_en },
                               stops: tripDetails.stops.map(s => ({ id: s.id, name: s.name_en })),
                               date: tripDetails.date
                           }}
                        />
                     )}
                     {!tripDetails && loading && (
                         <div className="h-14 w-full bg-white/10 animate-pulse rounded-xl"></div>
                     )}
                 </div>
             </div>
         </div>
      </div>

      <div className="container-custom pt-8">
         {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                 <p className="text-gray-500">Finding the best rides for you...</p>
             </div>
         ) : !tripDetails ? (
             <div className="text-center py-20">
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Start your journey</h2>
                 <p className="text-gray-500 mb-6">Please select a pickup and drop-off location to see available cars.</p>
                 <Button onClick={() => navigate('/')}>Go Home</Button>
             </div>
         ) : (
             <div className="flex flex-col gap-8">
                 {/* Trip Summary */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-6 items-center justify-between">
                     <div className="flex flex-wrap gap-8 items-center">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase">From</span>
                            <span className="font-semibold text-lg text-gray-900">{tripDetails.from.name_en}</span>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-green-500 rotate-180 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase">To</span>
                            <span className="font-semibold text-lg text-gray-900">{tripDetails.to.name_en}</span>
                        </div>
                     </div>
                     <div className="flex gap-4 text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100 font-medium">
                        <span>{tripDetails.distance} km</span>
                        <span className="text-green-300">|</span>
                        <span>{Math.floor(tripDetails.duration / 60)}h {tripDetails.duration % 60}m</span>
                     </div>
                 </div>

                 {/* Results Grid */}
                 <div>
                     <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        Available Vehicles 
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-100">{cars.length}</span>
                     </h2>
                     
                     {cars.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {cars.map(car => (
                                 <CarResultCard 
                                     key={car.id} 
                                     car={car} 
                                     onBook={() => handleBook(car)} 
                                     vertical={true}
                                 />
                             ))}
                         </div>
                     ) : (
                         <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                             <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                             <h3 className="text-lg font-bold text-gray-900 mb-2">No cars available</h3>
                             <p className="text-gray-500 max-w-md mx-auto mb-6">
                                 We couldn't find any available cars for this specific route.
                             </p>
                             <Button variant="outline" onClick={() => navigate('/')}>
                                 <RefreshCw className="w-4 h-4 mr-2" /> Search Again
                             </Button>
                         </div>
                     )}
                 </div>
             </div>
         )}
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        car={selectedCar} 
        searchParams={modalSearchParams}
      />
    </div>
  );
};

export default SearchResults;