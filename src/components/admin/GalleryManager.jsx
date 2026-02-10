import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Loader2, GripVertical, Star } from 'lucide-react';
import { uploadTourGalleryImage, updateTourDetails } from '@/lib/tourDetailService';
import { useToast } from '@/components/ui/use-toast';
import { Reorder, useDragControls } from 'framer-motion';

const GalleryItem = ({ image, index, onRemove, isMain }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={image}
      dragListener={false}
      dragControls={controls}
      className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm"
    >
      <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div 
          className="p-2 bg-white rounded-full cursor-move hover:bg-gray-100"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
        <button 
          onClick={() => onRemove(image)}
          className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isMain && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm font-bold">
           <Star className="w-3 h-3 fill-white" /> Main
        </div>
      )}
    </Reorder.Item>
  );
};

const GalleryManager = ({ tour, onUpdate }) => {
  const { toast } = useToast();
  const [images, setImages] = useState(tour.gallery_images || []);
  const [uploading, setUploading] = useState(false);

  // Sync internal state if tour prop updates significantly, though usually we control from parent or here.
  // We'll manage local state for optimistic UI updates and call onUpdate to save.

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Check limits
    if (images.length + files.length > 10) {
        toast({ variant: "destructive", title: "Limit exceeded", description: "Maximum 10 images allowed per tour." });
        return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadTourGalleryImage(tour.id, file));
      const newUrls = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newUrls];
      
      setImages(updatedImages);
      await updateTourDetails(tour.id, { gallery_images: updatedImages });
      onUpdate({ ...tour, gallery_images: updatedImages });
      
      toast({ title: "Success", description: "Images uploaded successfully" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemove = async (imageUrl) => {
    if (!window.confirm("Delete this image?")) return;
    const updatedImages = images.filter(img => img !== imageUrl);
    setImages(updatedImages);
    try {
        await updateTourDetails(tour.id, { gallery_images: updatedImages });
        onUpdate({ ...tour, gallery_images: updatedImages });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete image" });
        // Revert on error if needed
    }
  };

  const handleReorder = async (newOrder) => {
      setImages(newOrder);
      // We only save to DB on drop or explicit save? 
      // For Reorder component, it updates state continuously. We should debounce save or save on drag end.
      // Reorder.Group onChange handles the state update. We should trigger API call separately if possible or just do it.
      // Doing it on every swap is expensive.
      // Let's rely on a separate "Save Order" or assume optimistic update is fine but real save needs debouncing.
      // For simplicity here, we'll update DB immediately but might be spammy. 
      // Better: Update local state, and have a useEffect or specific event.
      // Actually Reorder.Group doesn't have an onDragEnd with the new order easily.
      // We will update DB in the onReorder (setImages) wrapper after a small delay or use a manual button?
      // Let's update DB directly for now, assuming low volume.
      try {
        await updateTourDetails(tour.id, { gallery_images: newOrder });
        // Don't need to call onUpdate immediately if we just reordered visual
      } catch (err) {
        console.error("Failed to reorder", err);
      }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-semibold">Gallery Images</h3>
           <p className="text-sm text-gray-500">Drag to reorder. First image is the main cover.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">{images.length}/10</span>
            <div className="relative">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleUpload}
                    disabled={uploading || images.length >= 10}
                />
                <Button variant="outline" disabled={uploading || images.length >= 10}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Add Images
                </Button>
            </div>
        </div>
      </div>

      <Reorder.Group axis="y" values={images} onReorder={handleReorder} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
            <GalleryItem 
                key={img} 
                image={img} 
                index={idx} 
                onRemove={handleRemove} 
                isMain={idx === 0} 
            />
        ))}
      </Reorder.Group>

      {images.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No images yet. Upload some photos to showcase the tour.</p>
          </div>
      )}
    </Card>
  );
};

export default GalleryManager;