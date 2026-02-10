import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import BookingStep1 from './BookingStep1';
import BookingStep2 from './BookingStep2';
import BookingStep3 from './BookingStep3';
import BookingConfirmation from './BookingConfirmation';
import BookingSuccess from './BookingSuccess';

const BookingModal = ({ isOpen, onClose, car, searchParams }) => {
  const [step, setStep] = useState(1);
  const [bookingResult, setBookingResult] = useState(null);

  // Reset modal state when closed
  const handleClose = () => {
    setStep(1);
    setBookingResult(null);
    setFormData({
      passengerCount: 1,
      passengerName: '',
      passengerPhone: '+995',
      passengerEmail: '',
      specialRequests: '',
      paymentMethod: 'cash'
    });
    onClose();
  };
  
  const [formData, setFormData] = useState({
    passengerCount: 1,
    passengerName: '',
    passengerPhone: '+995',
    passengerEmail: '',
    specialRequests: '',
    paymentMethod: 'cash'
  });

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSuccess = (booking) => {
    setBookingResult(booking);
    setStep(5);
  };

  const stepTitles = [
    "Trip Details",
    "Passenger Details",
    "Payment Method",
    "Review Booking",
    "Booking Confirmed"
  ];

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 sticky top-0">
           <div className="flex items-center gap-2">
             {step > 1 && step < 5 && (
               <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={prevStep}>
                 <ChevronLeft className="w-5 h-5" />
               </Button>
             )}
             <div>
               <h2 className="text-lg font-bold text-gray-900">{stepTitles[step - 1]}</h2>
               {step < 5 && <p className="text-xs text-gray-500">Step {step} of 4</p>}
             </div>
           </div>
           
           {/* Progress Indicator */}
           {step < 5 && (
             <div className="flex gap-1">
               {[1, 2, 3, 4].map(s => (
                 <div 
                   key={s} 
                   className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`}
                 />
               ))}
             </div>
           )}
           
           {step < 5 && (
             <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={handleClose}>
                <X className="w-5 h-5" />
             </Button>
           )}
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <BookingStep1 
              data={formData} 
              onNext={nextStep} 
              onUpdateData={updateFormData}
              car={car}
              searchParams={searchParams}
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
              car={car}
              searchParams={searchParams}
              onBack={prevStep}
              onSuccess={handleSuccess}
            />
          )}
          {step === 5 && (
            <BookingSuccess 
              booking={bookingResult} 
              car={car}
              searchParams={searchParams}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;