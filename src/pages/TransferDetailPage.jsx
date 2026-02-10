import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransferWithCars } from '@/lib/transferService';
import TransferCarCard from '@/components/transfers/TransferCarCard';
import { Loader2, ChevronRight, Clock, MapPin, Navigation, Car as CarIcon, Info, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TransferDetailPage = () => {
  const { transferId } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!transferId) return;
      try {
        const data = await getTransferWithCars(transferId);
        setTransfer(data);
        setCars(data.cars || []);
      } catch (error) {
        console.error("Error fetching transfer details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [transferId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Transfer Not Found</h1>
        <Link to="/">
          <Button className="bg-green-600 hover:bg-green-700 rounded-full px-8">Return Home</Button>
        </Link>
      </div>
    );
  }

  const fromName = transfer.from_location?.name_en;
  const toName = transfer.to_location?.name_en;
  const title = `${fromName} to ${toName}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>Transfer {title} | Available Cars</title>
      </Helmet>

      {/* Dark Hero Header */}
      <div className="bg-gray-950 text-white pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-gray-950 to-blue-900/20 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(16,185,129,0.1),transparent_60%)]" />
        
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
            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{title}</span>
          </nav>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-4 tracking-wide border border-white/20">
            <Navigation className="w-4 h-4 text-green-400" />
            Private Transfer
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-4">
             <div>
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 leading-tight">
                  {fromName} <ArrowRight className="inline w-6 h-6 md:w-8 md:h-8 text-green-400 mx-2" /> {toName}
                </h1>
                <p className="text-gray-300 text-lg max-w-xl">
                  Select your preferred vehicle for this route. All prices are fixed and include all fees.
                </p>
             </div>
             
             {/* Route Stats */}
             <div className="flex flex-wrap gap-3">
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl text-white font-medium border border-white/20">
                    <Navigation className="w-4 h-4 text-green-400" />
                    <span>{transfer.distance_km} km</span>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl text-white font-medium border border-white/20">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span>{Math.floor(transfer.duration_minutes / 60)}h {transfer.duration_minutes % 60}m</span>
                 </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-12">
         <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Available Cars
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-100">
                {cars.length}
              </span>
            </h2>
            
            <div className="text-sm text-gray-500 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <Info className="w-4 h-4 text-green-600" />
              All prices are final (GEL)
            </div>
         </div>

         {cars.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <TransferCarCard 
                   key={car.id} 
                   car={car} 
                   transferId={transfer.id}
                   basePrice={transfer.base_price}
                />
              ))}
           </div>
         ) : (
           <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <CarIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No cars currently available</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                 We couldn't find any cars specifically assigned to this route right now. Please try contacting us for a custom quote.
              </p>
              <Link to="/contact">
                <Button className="bg-green-600 hover:bg-green-500 text-white px-8 h-12 text-base shadow-lg shadow-green-200 rounded-full font-bold">
                  Contact Support
                </Button>
              </Link>
           </div>
         )}
      </div>
    </div>
  );
};

export default TransferDetailPage;