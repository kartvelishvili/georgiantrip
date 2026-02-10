import React, { useEffect, useState } from 'react';
import { getAllTransfers } from '@/lib/transferService';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, Search, MapPin, ArrowRight, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import HeroSearch from '@/components/customer/HeroSearch';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { content } = useSiteContent('pages', 'transfers', DEFAULT_CONTENT.pages.transfers);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const data = await getAllTransfers();
        setTransfers(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  const filteredTransfers = transfers.filter(t => 
    t.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.from_location?.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.to_location?.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransferClick = (transfer) => {
    navigate(`/transfer/s/${transfer.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>All Transfers | GeorgianTrip</title>
      </Helmet>
      
      {/* Hero Header */}
      <div className="bg-gray-950 text-white py-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-gray-950 to-blue-900/20 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_60%)]" />
        <motion.div 
          className="container-custom relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-4 tracking-wide border border-white/20">
            <Navigation className="w-4 h-4" />
            Private Transfers
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{content.title || "Transfer Routes"}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
            {content.subtitle || "Fixed price private transfers to all major destinations in Georgia. Book online, pay driver in cash."}
          </p>
            
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <HeroSearch compact={true} />
          </div>
        </motion.div>
      </div>

      <div className="container-custom pt-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <h2 className="text-2xl font-bold text-gray-900">Available Routes ({filteredTransfers.length})</h2>
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input 
                 placeholder="Search routes..." 
                 className="pl-9 bg-white rounded-xl"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : filteredTransfers.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTransfers.map(transfer => (
                 <div 
                    key={transfer.id}
                    onClick={() => handleTransferClick(transfer)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                 >
                    <div className="h-48 overflow-hidden relative bg-gray-100">
                        {transfer.image_url ? (
                           <img 
                             src={transfer.image_url} 
                             alt={transfer.name_en} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                              <MapPin className="w-12 h-12 opacity-20" />
                           </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-white font-bold text-lg leading-tight">{transfer.name_en}</h3>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase font-bold">Distance</span>
                              <span className="font-medium text-gray-900">{transfer.distance_km} km</span>
                           </div>
                           <div className="flex flex-col text-right">
                              <span className="text-xs text-gray-500 uppercase font-bold">Time</span>
                              <span className="font-medium text-gray-900">~{Math.round(transfer.duration_minutes/60)} hrs</span>
                           </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div>
                               <p className="text-xs text-gray-400">Fixed Price</p>
                               <p className="text-xl font-bold text-green-600">{formatCurrency(transfer.base_price)}</p>
                            </div>
                            <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-700 group-hover:scale-110 transition-transform">
                               <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">No transfers found matching your search.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default TransfersPage;