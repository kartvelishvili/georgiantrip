import React from 'react';
import { MapPin, Clock, Info, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TransferDetails = ({ transfer }) => {
  if (!transfer) return null;

  return (
    <Card className="p-6 border-gray-100 shadow-sm space-y-6">
      <h3 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
        <Info className="w-5 h-5 text-green-600" />
        Route Details
      </h3>

      <div className="space-y-6 relative">
          {/* Connecting Line */}
          <div className="absolute left-[11px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

          <div className="flex gap-4 relative z-10">
             <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 shrink-0 mt-1"></div>
             <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pick-up Location</p>
                <p className="font-bold text-gray-900 text-lg">{transfer.from_location?.name_en || "Tbilisi"}</p>
                {transfer.from_location?.lat && (
                   <p className="text-xs text-gray-400 mt-1 font-mono">
                      {transfer.from_location.lat}, {transfer.from_location.lng}
                   </p>
                )}
             </div>
          </div>

          <div className="flex gap-4 relative z-10">
             <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 shrink-0 mt-1"></div>
             <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Drop-off Location</p>
                <p className="font-bold text-gray-900 text-lg">{transfer.to_location?.name_en || "Destination"}</p>
                {transfer.to_location?.lat && (
                   <p className="text-xs text-gray-400 mt-1 font-mono">
                      {transfer.to_location.lat}, {transfer.to_location.lng}
                   </p>
                )}
             </div>
          </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
         <h4 className="font-bold text-gray-900 mb-3">About this transfer</h4>
         <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Enjoy a comfortable private transfer from {transfer.from_location?.name_en} to {transfer.to_location?.name_en}. 
            Our professional drivers ensure a safe and smooth journey. The price is fixed per vehicle and includes all taxes and fees.
         </p>
         
         <div className="grid grid-cols-2 gap-3">
             <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Free cancellation</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Meet & Greet</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Fixed Price</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Flight monitoring</span>
             </div>
         </div>
      </div>
    </Card>
  );
};

export default TransferDetails;