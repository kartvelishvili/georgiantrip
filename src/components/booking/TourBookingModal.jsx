import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Calendar, User, CreditCard, Banknote } from 'lucide-react';
import { createTourBooking } from '@/lib/bookingService';

const TourBookingModal = ({ isOpen, onClose, tour, initialData }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    passengers: initialData?.passengers || 1,
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'card'
  });

  const totalPrice = tour ? tour.price_per_person * formData.passengers : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        await createTourBooking({
            tour_id: tour.id,
            tour_date: formData.date,
            passenger_count: formData.passengers,
            passenger_name: formData.name,
            passenger_email: formData.email,
            passenger_phone: formData.phone,
            payment_method: formData.paymentMethod,
            total_price: totalPrice,
            booking_status: 'pending'
        });
        
        setSuccess(true);
        setStep(3);
    } catch (err) {
        console.error(err);
        toast({
            variant: 'destructive',
            title: "Booking Failed",
            description: "Something went wrong. Please try again."
        });
    } finally {
        setLoading(false);
    }
  };

  if (!tour) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl">
        <DialogHeader className="p-6 border-b border-gray-100">
           <DialogTitle className="text-xl font-bold">{success ? 'Booking Confirmed!' : 'Book This Tour'}</DialogTitle>
        </DialogHeader>

        {success ? (
           <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                 <Calendar className="w-10 h-10" />
              </div>
              <div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                 <p className="text-gray-500">Your booking request has been received. We will contact you shortly to confirm details.</p>
              </div>
              <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">Close</Button>
           </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-xl flex gap-4 items-center">
                    <img src={tour.image_url} alt={tour.name_en} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                        <h4 className="font-bold text-gray-900">{tour.name_en}</h4>
                        <p className="text-sm text-gray-500">{formData.date} • {formData.passengers} Guests</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-bold text-green-600">{formatCurrency(totalPrice)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Full Name</Label>
                            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+995 ..." />
                        </div>
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                    </div>
                    
                    <div>
                        <Label className="mb-2 block">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-4">
                           <div 
                                className={`border p-3 rounded-xl cursor-pointer flex items-center gap-2 ${formData.paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                                onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                           >
                              <CreditCard className="w-4 h-4" /> Card
                           </div>
                           <div 
                                className={`border p-3 rounded-xl cursor-pointer flex items-center gap-2 ${formData.paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                                onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                           >
                              <Banknote className="w-4 h-4" /> Cash
                           </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirm Booking • ${formatCurrency(totalPrice)}`}
                </Button>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TourBookingModal;