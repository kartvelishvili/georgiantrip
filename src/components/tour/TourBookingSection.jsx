import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Calendar } from 'lucide-react';

const TourBookingSection = ({ tour, onBook }) => {
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState('');

  const totalPrice = tour ? tour.price_per_person * passengers : 0;

  const handleBook = () => {
    if (!date) {
        // Simple alert or toast in real app
        alert("Please select a date");
        return;
    }
    onBook({ passengers, date });
  };

  return (
    <Card className="p-6 sticky top-24 shadow-xl border-gray-100 bg-white rounded-2xl">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Price per person</p>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">{formatCurrency(tour.price_per_person)}</span>
            <span className="text-gray-400">GEL</span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
         <div className="space-y-2">
            <Label className="font-bold">Select Date</Label>
            <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input 
                    type="date" 
                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
         </div>

         <div className="space-y-2">
            <Label className="font-bold">Guests</Label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-white shadow-sm hover:bg-gray-100"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                >
                    <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-lg w-8 text-center">{passengers}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-white shadow-sm hover:bg-gray-100"
                    onClick={() => setPassengers(Math.min(8, passengers + 1))}
                    disabled={passengers >= 8}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
         </div>

         <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(tour.price_per_person)} x {passengers} guests</span>
                <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(totalPrice)}</span>
            </div>
         </div>
      </div>

      <Button onClick={handleBook} className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 rounded-xl">
         Book Tour
      </Button>
      <p className="text-xs text-center text-gray-400 mt-3">No prepayment required</p>
    </Card>
  );
};

export default TourBookingSection;