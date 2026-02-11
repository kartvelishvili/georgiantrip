import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

// Import Booking Steps
import BookingStep1 from '@/components/booking/BookingStep1';
import BookingStep2 from '@/components/booking/BookingStep2';
import BookingStep3 from '@/components/booking/BookingStep3';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import BookingSuccess from '@/components/booking/BookingSuccess';

const BookingCreationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const carId = searchParams.get('carId');
  const transferId = searchParams.get('transferId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ car: null, transfer: null });
  
  // Booking Wizard State
  const [step, setStep] = useState(1);
  const [bookingResult, setBookingResult] = useState(null);
  const [formData, setFormData] = useState({
    passengerCount: 1,
    passengerName: '',
    passengerPhone: '+995',
    passengerEmail: '',
    specialRequests: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!carId || !transferId) {
        setError("Missing booking information");
        setLoading(false);
        return;
      }

      try {
        // Fetch Car
        const { data: car, error: carError } = await supabase
          .from('cars')
          .select('*, driver:drivers(*)')
          .eq('id', carId)
          .single();

        if (carError) throw carError;

        // Fetch Transfer
        const { data: transfer, error: transferError } = await supabase
          .from('transfers')
          .select('*, from_location:locations!transfers_from_location_id_fkey(*), to_location:locations!transfers_to_location_id_fkey(*)')
          .eq('id', transferId)
          .single();

        if (transferError) throw transferError;

        setData({ car, transfer });
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError("Could not load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [carId, transferId]);

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSuccess = (booking) => {
    setBookingResult(booking);
    setStep(5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to start booking</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const { car, transfer } = data;

  // Prepare data for steps
  const bookingParams = {
    startLocation: {
      ...transfer.from_location,
      name: transfer.from_location?.name_en || transfer.from_location?.name
    },
    endLocation: {
      ...transfer.to_location,
      name: transfer.to_location?.name_en || transfer.to_location?.name
    },
    date: new Date().toISOString().split('T')[0],
    distance: transfer.distance_km,
    duration: transfer.duration_minutes
  };

  // Ensure car has the correct price (transfer base price overrides car default if set)
  const carWithPrice = {
    ...car,
    price: transfer.base_price || car.calculatedPrice || car.price || 0
  };

  const stepTitles = [
    "Trip Details",
    "Passenger Details",
    "Payment Method",
    "Review Booking",
    "Booking Confirmed"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <Helmet>
        <title>Complete Your Booking | GeorgianTrip</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 -ml-4">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </Button>
          <div className="text-right">
             <h1 className="text-2xl font-bold text-gray-900">Booking</h1>
             <p className="text-sm text-gray-500">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
               {stepTitles.slice(0, 4).map((title, idx) => (
                 <span key={idx} className={`text-xs font-medium ${step > idx ? 'text-green-600' : 'text-gray-400'}`}>
                   {title}
                 </span>
               ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {step === 1 && (
              <BookingStep1 
                data={formData} 
                onNext={nextStep} 
                onUpdateData={updateFormData}
                car={carWithPrice}
                searchParams={bookingParams}
              />
            )}
            {step === 2 && (
              <BookingStep2 
                data={formData} 
                onNext={nextStep} 
                onBack={prevStep}
                onUpdateData={updateFormData} 
              />
            )}
            {step === 3 && (
              <BookingStep3 
                data={formData} 
                onNext={nextStep} 
                onBack={prevStep}
                onUpdateData={updateFormData} 
              />
            )}
            {step === 4 && (
              <BookingConfirmation 
                data={formData} 
                car={carWithPrice}
                searchParams={bookingParams}
                onBack={prevStep}
                onSuccess={handleSuccess}
              />
            )}
            {step === 5 && (
              <BookingSuccess 
                booking={bookingResult} 
                car={carWithPrice}
                searchParams={bookingParams}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCreationPage;