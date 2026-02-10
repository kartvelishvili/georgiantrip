import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PriceBreakdown = ({ basePrice, finalPrice, distance }) => {
  const discount = basePrice > finalPrice;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Price Breakdown</h3>
      
      <div className="space-y-3">
         <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Base Fare</span>
            <span>{formatCurrency(basePrice)}</span>
         </div>
         
         {distance > 200 && (
            <div className="flex justify-between items-center text-sm text-green-600">
               <div className="flex items-center gap-1">
                  <span>Long Distance Discount</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                      <TooltipContent><p>Discount applied for trips over 200km</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
               </div>
               <span>- {formatCurrency(basePrice - finalPrice)}</span>
            </div>
         )}
         
         <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex justify-between items-end">
               <div>
                  <span className="block text-sm text-gray-500 mb-1">Total Price</span>
                  <span className="text-xs text-gray-400 font-medium">Includes all fees & taxes</span>
               </div>
               <div className="text-right">
                  <span className="block text-3xl font-heading font-bold text-green-600">{formatCurrency(finalPrice)}</span>
               </div>
            </div>
            <div className="bg-gray-50 text-gray-500 text-xs py-2 px-3 rounded-lg mt-4 text-center">
               This is the final price! No hidden charges.
            </div>
         </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;