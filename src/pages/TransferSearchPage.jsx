import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getTransferBySlug, searchCarsForTransfer } from '@/lib/transferService';
import TransferHeader from '@/components/transfer/TransferHeader';
import TransferSearchForm from '@/components/transfer/TransferSearchForm';
import TransferDetails from '@/components/transfer/TransferDetails';
import CarResultCard from '@/components/search/CarResultCard';
import BookingModal from '@/components/booking/BookingModal';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateTripPrice } from '@/lib/pricing';

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
           // Initial fetch of cars for today/tomorrow
           const today = new Date().toISOString().split('T')[0];
           await fetchCars(data, today);
           
           // Set initial search data for context
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
        
        // Calculate prices for each car based on the transfer distance
        // We use the base_price from the transfer as a baseline, but cars might have their own multipliers
        // For simplicity here, we can override or merge logic. 
        // Let's use the standard pricing logic but ensure it roughly matches the transfer's base_price for display consistency
        
        const calculatedCars = availableCars.map(car => {
            const price = calculateTripPrice(transferData.distance_km, null, null); // Simplified
            // Or use the transfer.base_price if strictly fixed
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
    // When user changes date or location in the form
    setCurrentSearchData(searchData);
    if (transfer) {
        fetchCars(transfer, searchData.date);
    }
  };

  const handleBook = (car) => {
    setSelectedCar(car);
    setIsBookingModalOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  
  if (!transfer) return (
      <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Transfer Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
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

              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Available Vehicles</h2>
                      <span className="text-sm text-gray-500">{cars.length} options found</span>
                  </div>

                  {carsLoading ? (
                      <div className="space-y-4">
                          {[1, 2].map(i => (
                             <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
                          ))}
                      </div>
                  ) : cars.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <div className="bg-white p-8 rounded-xl text-center border border-gray-100 shadow-sm">
                          <p className="text-gray-500 mb-4">No cars available for this date.</p>
                          <Button variant="outline" onClick={() => fetchCars(transfer, new Date().toISOString().split('T')[0])}>
                              <RefreshCw className="w-4 h-4 mr-2" /> Try Today
                          </Button>
                      </div>
                  )}
              </div>
           </div>

           {/* Right Column: Details Sidebar */}
           <div className="lg:col-span-1 pt-8 lg:pt-0">
               <div className="sticky top-24">
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