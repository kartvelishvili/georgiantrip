import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, MapPin, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const TransferHeader = ({ transfer }) => {
  if (!transfer) return null;

  return (
    <div className="bg-white border-b border-gray-100 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/" className="hover:text-green-600">Transfers</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium truncate">{transfer.name_en}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {transfer.name_en}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="font-medium">{transfer.distance_km} km</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium">
                   {Math.floor(transfer.duration_minutes / 60)}h {transfer.duration_minutes % 60 > 0 ? `${transfer.duration_minutes % 60}m` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
            <span className="text-sm text-gray-500 font-medium mb-1">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-600">{formatCurrency(transfer.base_price)}</span>
              <span className="text-gray-400 font-medium">/ vehicle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferHeader;