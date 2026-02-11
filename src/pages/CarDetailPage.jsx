import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getCarById } from '@/lib/carService';
import { getTransferById, getLocationById } from '@/lib/transferService';
import { calculateDistance } from '@/lib/pricing';
import { Helmet } from 'react-helmet';
import { Loader2, ArrowLeft, MapPin, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import CarHeader from '@/components/car/CarHeader';
import CarDetails from '@/components/car/CarDetails';
import CarBookingForm from '@/components/car/CarBookingForm';
import RelatedCars from '@/components/car/RelatedCars';
import DriverProfile from '@/components/car/DriverProfile';

const CarDetailPage = () => {
  const { carId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [activeTransfer, setActiveTransfer] = useState(null);
  
  // Extract params for pre-filling
  const transferIdParam = searchParams.get('transfer');
  const fromIdParam = searchParams.get('from');
  const toIdParam = searchParams.get('to');
  const dateParam = searchParams.get('date');
  const travelersParam = searchParams.get('travelers');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Car
        const carData = await getCarById(carId);
        // Ensure price_per_km has a fallback
        if (!carData.price_per_km) carData.price_per_km = 2;
        setCar(carData);

        // 2. Resolve Transfer/Route Info
        if (transferIdParam) {
           // If explicit transfer ID passed
           const transferData = await getTransferById(transferIdParam);
           setActiveTransfer(transferData);
        } else if (fromIdParam && toIdParam) {
           // If locations passed, construct ad-hoc transfer object for display
           const fromLoc = await getLocationById(fromIdParam);
           const toLoc = await getLocationById(toIdParam);
           
           if (fromLoc && toLoc) {
               // Calculate distance dynamically
               const dist = await calculateDistance(fromLoc, toLoc);
               
               setActiveTransfer({
                   id: 'custom',
                   from_location_id: fromLoc.id,
                   to_location_id: toLoc.id,
                   from_location: fromLoc,
                   to_location: toLoc,
                   distance_km: dist, 
                   name_en: `${fromLoc.name_en} - ${toLoc.name_en}`
               });
           }
        } else if (carData.transfer) {
           // Fallback to car's default transfer if available
           setActiveTransfer(carData.transfer);
        }

      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (carId) fetchData();
  }, [carId, transferIdParam, fromIdParam, toIdParam]);

  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <Loader2 className="w-10 h-10 animate-spin text-green-600" />
       </div>
    );
  }

  if (!car) return <div className="text-center py-20">Car not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
       <Helmet>
          <title>{car.make} {car.model} | Booking</title>
       </Helmet>
       
       <div className="container-custom">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-gray-500 hover:text-gray-900 pl-0 hover:bg-transparent"
          >
             <ArrowLeft className="w-5 h-5 mr-2" /> Back to Search
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             
             {/* Left Column (Details) */}
             <div className="lg:col-span-2 space-y-8">
                <CarHeader car={car} />
                
                {/* Route Summary Card */}
                {activeTransfer && (
                  <Card className="p-6 border-green-100 bg-green-50/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-green-600" /> 
                      Trip Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase text-gray-500">Route</div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                           <MapPin className="w-4 h-4 text-green-600" />
                           {activeTransfer.from_location?.name_en} <span className="text-gray-400">→</span> {activeTransfer.to_location?.name_en}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase text-gray-500">Distance</div>
                        <div className="font-medium text-gray-900">{Math.round(activeTransfer.distance_km)} km</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase text-gray-500">Base Rate</div>
                        <div className="font-medium text-gray-900">GEL {car.price_per_km} / km</div>
                      </div>
                      {dateParam && (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold uppercase text-gray-500">Date</div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            {dateParam}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <CarDetails car={car} />
                <DriverProfile driver={car.driver} />
             </div>

             {/* Right Column (Booking Form) */}
             <div className="lg:col-span-1">
                <CarBookingForm 
                    car={car} 
                    transfer={activeTransfer} 
                    initialDate={dateParam}
                    initialTravelers={travelersParam}
                />
             </div>
          </div>

          <RelatedCars currentCarId={car.id} transferId={activeTransfer?.id !== 'custom' ? activeTransfer?.id : car.transfer_id} />
       </div>
    </div>
  );
};

export default CarDetailPage;