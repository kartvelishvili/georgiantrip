import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTourDetails, updateTourDetails } from '@/lib/tourDetailService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Share, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import GalleryManager from '@/components/admin/GalleryManager';
import PricingManager from '@/components/admin/PricingManager';
import ItineraryManager from '@/components/admin/ItineraryManager';
import IncludedItemsManager from '@/components/admin/IncludedItemsManager';
import TourForm from '@/components/admin/TourForm'; // Reuse existing form for basic info
import { Dialog, DialogContent } from '@/components/ui/dialog';

const AdminTourDetailPage = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditBasicOpen, setIsEditBasicOpen] = useState(false);

  useEffect(() => {
    fetchTour();
  }, [tourId]);

  const fetchTour = async () => {
    setLoading(true);
    try {
      const data = await getTourDetails(tourId);
      setTour(data);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load tour details" });
      navigate('/admin/tours');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocal = (updatedData) => {
     setTour(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
  if (!tour) return null;

  return (
    <div className="container-custom py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/tours')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {tour.name_en} 
              {tour.is_featured && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full border border-yellow-200">Featured</span>}
              {!tour.is_active && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-200">Inactive</span>}
            </h1>
            <p className="text-gray-500 text-sm">ID: {tour.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/tours/${tour.id}`, '_blank')}>
            <Globe className="w-4 h-4 mr-2" /> View Live
          </Button>
          <Button onClick={() => setIsEditBasicOpen(true)}>
             Edit Basic Info
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="included">Inclusions</TabsTrigger>
          <TabsTrigger value="tobring">To Bring</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="gallery">
             <GalleryManager tour={tour} onUpdate={handleUpdateLocal} />
          </TabsContent>
          
          <TabsContent value="pricing">
             <PricingManager tour={tour} onUpdate={handleUpdateLocal} />
          </TabsContent>

          <TabsContent value="itinerary">
             <ItineraryManager tour={tour} onUpdate={handleUpdateLocal} />
          </TabsContent>

          <TabsContent value="included">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <IncludedItemsManager tour={tour} onUpdate={handleUpdateLocal} type="included" />
                 {/* Can add another component here if needed, or just layout */}
             </div>
          </TabsContent>

          <TabsContent value="tobring">
             <div className="max-w-2xl">
                <IncludedItemsManager tour={tour} onUpdate={handleUpdateLocal} type="bring" />
             </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit Basic Info Modal */}
      <Dialog open={isEditBasicOpen} onOpenChange={setIsEditBasicOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
             <TourForm 
                tour={tour} 
                onClose={(shouldRefresh) => {
                    setIsEditBasicOpen(false);
                    if(shouldRefresh) fetchTour();
                }} 
             />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTourDetailPage;