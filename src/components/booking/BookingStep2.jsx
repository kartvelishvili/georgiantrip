import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BookingStep2 = ({ data, onNext, onBack, onUpdateData }) => {
  const { passengerName, passengerPhone, passengerEmail, specialRequests } = data;

  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const newErrors = {};
    if (!passengerName || passengerName.length < 3) {
      newErrors.passengerName = "Name must be at least 3 characters";
    }
    // Simple Georgia phone validation +995 5XX XXX XXX
    const phoneRegex = /^\+995\s?5\d{2}\s?\d{3}\s?\d{3}$/;
    // Allow spaces or no spaces
    const cleanPhone = passengerPhone.replace(/\s/g, '');
    if (!passengerPhone || !cleanPhone.startsWith('+995') || cleanPhone.length !== 13) {
        // Basic length check for +995 + 9 digits
       newErrors.passengerPhone = "Enter valid Georgian number (+995 5XX XXX XXX)";
    }

    if (passengerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerEmail)) {
      newErrors.passengerEmail = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
          <Input 
            id="fullName" 
            placeholder="John Doe" 
            value={passengerName}
            onChange={(e) => onUpdateData({ passengerName: e.target.value })}
            className={errors.passengerName ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.passengerName && <p className="text-xs text-red-500">{errors.passengerName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
          <Input 
            id="phone" 
            placeholder="+995 5XX XXX XXX" 
            value={passengerPhone}
            onChange={(e) => onUpdateData({ passengerPhone: e.target.value })}
            className={errors.passengerPhone ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.passengerPhone && <p className="text-xs text-red-500">{errors.passengerPhone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-gray-400">(Optional)</span></Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com" 
            value={passengerEmail}
            onChange={(e) => onUpdateData({ passengerEmail: e.target.value })}
            className={errors.passengerEmail ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
           {errors.passengerEmail && <p className="text-xs text-red-500">{errors.passengerEmail}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="requests">Special Requests <span className="text-gray-400">(Optional)</span></Label>
            <span className="text-xs text-gray-400">{specialRequests.length}/500</span>
          </div>
          <Textarea 
            id="requests" 
            placeholder="Any special requests? (e.g., extra luggage, pet, etc.)" 
            value={specialRequests}
            maxLength={500}
            onChange={(e) => onUpdateData({ specialRequests: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="w-1/3 h-12 border-gray-200">
          Back
        </Button>
        <Button className="w-2/3 h-12 bg-green-600 hover:bg-green-700 font-bold" onClick={handleNext}>
          Next: Payment
        </Button>
      </div>
    </div>
  );
};

export default BookingStep2;