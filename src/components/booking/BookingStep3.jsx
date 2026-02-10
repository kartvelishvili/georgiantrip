import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingStep3 = ({ data, onNext, onBack, onUpdateData }) => {
  const { paymentMethod } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">Select Payment Method</h3>
        
        <RadioGroup value={paymentMethod} onValueChange={(val) => onUpdateData({ paymentMethod: val })} className="grid gap-4">
          
          {/* Card Option */}
          <Label
            htmlFor="card"
            className={`flex items-center justify-between px-4 py-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
              paymentMethod === 'card' ? 'border-green-500 bg-green-50/30 ring-1 ring-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${paymentMethod === 'card' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-gray-900">Card</span>
                <span className="text-xs text-gray-500">Visa, Mastercard, Amex</span>
              </div>
            </div>
            <RadioGroupItem value="card" id="card" className="data-[state=checked]:border-green-600 data-[state=checked]:text-green-600" />
          </Label>

          {/* Cash Option */}
          <Label
            htmlFor="cash"
            className={`flex items-center justify-between px-4 py-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
              paymentMethod === 'cash' ? 'border-green-500 bg-green-50/30 ring-1 ring-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${paymentMethod === 'cash' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-gray-900">Cash</span>
                <span className="text-xs text-gray-500">Pay to driver</span>
              </div>
            </div>
            <RadioGroupItem value="cash" id="cash" className="data-[state=checked]:border-green-600 data-[state=checked]:text-green-600" />
          </Label>
        </RadioGroup>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="w-1/3 h-12 border-gray-200">
          Back
        </Button>
        <Button className="w-2/3 h-12 bg-green-600 hover:bg-green-700 font-bold" onClick={onNext}>
          Review & Confirm
        </Button>
      </div>
    </motion.div>
  );
};

export default BookingStep3;