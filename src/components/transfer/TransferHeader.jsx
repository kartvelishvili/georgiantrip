import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Navigation, ArrowRight, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

const TransferHeader = ({ transfer }) => {
  if (!transfer) return null;

  const fromName = transfer.from_location?.name_en || 'Origin';
  const toName = transfer.to_location?.name_en || 'Destination';

  return (
    <div className="bg-gray-950 text-white pt-28 pb-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-gray-950 to-blue-900/20 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(16,185,129,0.08),transparent_60%)]" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />

      <motion.div 
        className="container-custom relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/transfers" className="hover:text-white transition-colors">Transfers</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{transfer.name_en}</span>
        </nav>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-6 tracking-wide border border-white/20">
          <Navigation className="w-4 h-4 text-green-400" />
          Private Transfer
        </span>

        {/* Route Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-5 leading-tight">
              {fromName} 
              <ArrowRight className="inline w-6 h-6 md:w-8 md:h-8 text-green-400 mx-3" /> 
              {toName}
            </h1>
            
            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl text-sm font-medium border border-white/10">
                <Navigation className="w-4 h-4 text-green-400" />
                {transfer.distance_km} km
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl text-sm font-medium border border-white/10">
                <Clock className="w-4 h-4 text-green-400" />
                {Math.floor(transfer.duration_minutes / 60)}h {transfer.duration_minutes % 60 > 0 ? `${transfer.duration_minutes % 60}m` : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl text-sm font-medium border border-white/10">
                <Shield className="w-4 h-4 text-green-400" />
                Fixed Price
              </span>
            </div>
          </div>

          {/* Price badge */}
          <div className="bg-white/[0.07] backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 text-center shrink-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Starting from</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-green-400">{formatCurrency(transfer.base_price)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">per vehicle</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransferHeader;