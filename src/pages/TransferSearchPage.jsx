import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getTransferBySlug, searchCarsForTransfer } from '@/lib/transferService';
import TransferHeader from '@/components/transfer/TransferHeader';
import TransferSearchForm from '@/components/transfer/TransferSearchForm';
import TransferDetails from '@/components/transfer/TransferDetails';
import CarResultCard from '@/components/search/CarResultCard';
import BookingModal from '@/components/booking/BookingModal';
import { Loader2, RefreshCw, Car as CarIcon, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateTripPrice } from '@/lib/pricing';
import { supabase } from '@/lib/customSupabaseClient';

const TransferSearchPage = () => {
  const { transferSlug } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);
  
  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentSearchData, setCurrentSearchData] = useState(null);

  useEffect(() => {
    const fetchTransferData = async () => {
      setLoading(true);
      try {
        const data = await getTransferBySlug(transferSlug);
        setTransfer(data);
        
        if (data) {
           const today = new Date().toISOString().split('T')[0];
           await fetchCars(data, today);
           
           setCurrentSearchData({
               startLocation: { 
                   id: data.from_location?.id, 
                   name: data.from_location?.name_en, 
                   lat: data.from_location?.lat, 
                   lng: data.from_location?.lng 
               },
               endLocation: { 
                   id: data.to_location?.id, 
                   name: data.to_location?.name_en, 
                   lat: data.to_location?.lat, 
                   lng: data.to_location?.lng 
               },
               stops: [],
               date: today
           });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (transferSlug) {
        fetchTransferData();
    }
  }, [transferSlug]);

  const fetchCars = async (transferData, date) => {
    setCarsLoading(true);
    try {
        const availableCars = await searchCarsForTransfer(
            transferData.from_location_id, 
            transferData.to_location_id, 
            date
        );
        
        // Fetch admin settings for proper pricing
        let adminSettings = null;
        try {
          const { data } = await supabase.from('admin_settings').select('*').maybeSingle();
          adminSettings = data;
        } catch (e) { /* use defaults */ }
        
        const calculatedCars = availableCars.map(car => {
            // Use driver-specific pricing if available, otherwise use standard pricing
            const driverPricing = car.driver_pricing || null;
            const price = calculateTripPrice(transferData.distance_km, adminSettings, driverPricing);
            // Transfer base_price takes precedence as the fixed route price
            return {
                ...car,
                calculatedPrice: Number(transferData.base_price) || price
            };
        });

        setCars(calculatedCars);
    } catch (err) {
        console.error(err);
    } finally {
        setCarsLoading(false);
    }
  };

  const handleSearch = (searchData) => {
    setCurrentSearchData(searchData);
    if (transfer) {
        fetchCars(transfer, searchData.date);
    }
  };

  const handleBook = (car) => {
    setSelectedCar(car);
    setIsBookingModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
        <p className="text-sm text-gray-400 font-medium">Loading transfer...</p>
      </div>
    </div>
  );
  
  if (!transfer) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">The transfer route you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6">Go Home</Button>
      </div>
    </div>
  );

  const modalSearchParams = currentSearchData ? {
      ...currentSearchData,
      distance: transfer.distance_km,
      duration: `${Math.floor(transfer.duration_minutes / 60)}h ${transfer.duration_minutes % 60}m`
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>{transfer.name_en} | GeorgianTrip Transfers</title>
        <meta name="description" content={`Book a private transfer from ${transfer.from_location?.name_en} to ${transfer.to_location?.name_en}. Fixed price ${transfer.base_price} GEL.`} />
      </Helmet>
      
      <TransferHeader transfer={transfer} />
      
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
           {/* Left Column: Search & Results */}
           <div className="lg:col-span-2 space-y-8">
              <TransferSearchForm 
                 startLocation={{ 
                     id: transfer.from_location?.id, 
                     name: transfer.from_location?.name_en, 
                     lat: transfer.from_location?.lat, 
                     lng: transfer.from_location?.lng 
                 }}
                 endLocation={{ 
                     id: transfer.to_location?.id, 
                     name: transfer.to_location?.name_en, 
                     lat: transfer.to_location?.lat, 
                     lng: transfer.to_location?.lng 
                 }}
                 onSearch={handleSearch}
              />

              <div className="space-y-5">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <CarIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Available Vehicles</h2>
                          <p className="text-xs text-gray-400 mt-0.5">Select a car to book your transfer</p>
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
                        {cars.length} {cars.length === 1 ? 'option' : 'options'}
                      </span>
                  </div>

                  {carsLoading ? (
                      <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                             <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                               <div className="flex flex-col sm:flex-row">
                                 <div className="sm:w-72 h-48 sm:h-52 bg-gray-100 animate-pulse" />
                                 <div className="flex-1 p-6 space-y-4">
                                   <div className="h-6 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
                                   <div className="h-4 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
                                   <div className="flex gap-2">
                                     <div className="h-8 bg-gray-100 rounded-full w-20 animate-pulse" />
                                     <div className="h-8 bg-gray-100 rounded-full w-20 animate-pulse" />
                                   </div>
                                   <div className="h-12 bg-gray-100 rounded-lg w-full animate-pulse mt-auto" />
                                 </div>
                               </div>
                             </div>
                          ))}
                      </div>
                  ) : cars.length > 0 ? (
                      <div className="space-y-4">
                          {cars.map(car => (
                              <CarResultCard 
                                  key={car.id} 
                                  car={car} 
                                  onBook={() => handleBook(car)}
                              />
                          ))}
                      </div>
                  ) : (
                      <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 shadow-sm">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                            <CarIcon className="w-7 h-7 text-gray-300" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">No vehicles available</h3>
                          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">No cars are available for this date. Try selecting a different date.</p>
                          <Button 
                            variant="outline" 
                            onClick={() => fetchCars(transfer, new Date().toISOString().split('T')[0])}
                            className="rounded-xl font-semibold"
                          >
                              <RefreshCw className="w-4 h-4 mr-2" /> Search Today
                          </Button>
                      </div>
                  )}
              </div>
           </div>

           {/* Right Column: Details Sidebar */}
           <div className="lg:col-span-1 pt-8 lg:pt-0">
               <div className="sticky top-24 space-y-6">
                   <TransferDetails transfer={transfer} />
               </div>
           </div>
        </div>
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

export default TransferSearchPage;