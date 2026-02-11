import React from 'react';
import { MapPin, Clock, Info, CheckCircle2, Shield, Headphones, Plane, CreditCard } from 'lucide-react';

const TransferDetails = ({ transfer }) => {
  if (!transfer) return null;

  const features = [
    { icon: Shield, text: 'Free cancellation 24h before' },
    { icon: Headphones, text: 'Meet & Greet service' },
    { icon: CreditCard, text: 'No hidden fees' },
    { icon: Plane, text: 'Flight monitoring' },
  ];

  return (
    <div className="space-y-6">
      {/* Route Visual Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <Info className="w-4 h-4 text-green-400" />
            Route Details
          </h3>

          <div className="space-y-0 relative">
            {/* Connecting Line */}
            <div className="absolute left-[11px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-500 to-red-400 opacity-40"></div>

            <div className="flex gap-4 relative z-10 pb-6">
              <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-400 shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Pick-up</p>
                <p className="font-bold text-white text-lg">{transfer.from_location?.name_en || "Origin"}</p>
              </div>
            </div>

            <div className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-red-500/20 border-2 border-red-400 shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Drop-off</p>
                <p className="font-bold text-white text-lg">{transfer.to_location?.name_en || "Destination"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Distance</p>
            <p className="text-lg font-bold text-gray-900">{transfer.distance_km} km</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Duration</p>
            <p className="text-lg font-bold text-gray-900">
              ~{Math.floor(transfer.duration_minutes / 60)}h {transfer.duration_minutes % 60 > 0 ? `${transfer.duration_minutes % 60}m` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">What's Included</h4>
        <div className="space-y-3">
          {features.map((feat, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">{feat.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">About this Transfer</h4>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enjoy a comfortable private transfer from {transfer.from_location?.name_en} to {transfer.to_location?.name_en}. 
          Our professional drivers ensure a safe and smooth journey. The price is fixed per vehicle and includes all taxes and fees.
        </p>
      </div>
    </div>
  );
};

export default TransferDetails;