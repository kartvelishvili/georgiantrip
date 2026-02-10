import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PriceSection = ({ priceGEL }) => {
  // Approximate conversion
  const priceUSD = Math.round(priceGEL * 0.37);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
       <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-medium mb-1">
          This is the final price! 
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <HelpCircle className="w-3 h-3" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Includes fuel and driver. No hidden fees.</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
       </div>
       
       <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-green-600 leading-none">
             GEL {priceGEL}
          </span>
          <span className="text-sm font-medium text-gray-400">
             (USD {priceUSD})
          </span>
       </div>
       
       <div className="text-xs text-green-600 font-medium mb-4">
          Price for the vehicle
       </div>
    </div>
  );
};

export default PriceSection;