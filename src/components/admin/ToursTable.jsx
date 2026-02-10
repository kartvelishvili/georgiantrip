import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Star, Settings, GripVertical } from 'lucide-react';
import TourForm from './TourForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/currencyUtils';
import { Reorder, useDragControls } from 'framer-motion';

const DraggableRow = ({ tour, onToggleFeatured, onEdit, onDelete }) => {
  const controls = useDragControls();
  
  return (
    <Reorder.Item
      value={tour}
      as="tr"
      dragListener={false}
      dragControls={controls}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted relative bg-white"
    >
      <TableCell className="w-[50px]">
         <div 
           className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-md inline-block touch-none"
           onPointerDown={(e) => controls.start(e)}
         >
           <GripVertical className="w-4 h-4 text-gray-400" />
         </div>
      </TableCell>
      <TableCell className="w-[50px] text-center text-xs text-gray-400">
         {tour.display_order}
      </TableCell>
      <TableCell>
          <button 
            onClick={() => onToggleFeatured(tour, tour.is_featured)}
            className={`p-1 rounded-full transition-colors ${tour.is_featured ? 'text-yellow-400 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-300 hover:text-yellow-400'}`}
            title="Toggle Featured"
          >
             <Star className={`w-5 h-5 ${tour.is_featured ? 'fill-yellow-400' : ''}`} />
          </button>
      </TableCell>
      <TableCell className="font-medium">
          <div className="flex flex-col">
              <span>{tour.name_en}</span>
              <span className="text-xs text-gray-400 truncate max-w-[200px]">{tour.id}</span>
          </div>
      </TableCell>
      <TableCell>{tour.duration_days} Days</TableCell>
      <TableCell>{formatPrice(tour.price_per_person)}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${tour.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {tour.is_active ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link to={`/admin/tours/${tour.id}`}>
              <Button size="icon" variant="outline" title="Manage Details">
                  <Settings className="w-4 h-4 text-gray-600" />
              </Button>
          </Link>
          <Button size="icon" variant="ghost" onClick={() => onEdit(tour)} title="Quick Edit">
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(tour.id)} title="Delete">
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </Reorder.Item>
  );
};

const ToursTable = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const { toast } = useToast();
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const saveTimeoutRef = useRef(null);

  const fetchTours = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('display_order', { ascending: true }); // Order by display_order
    
    if (error) {
      console.error('Error fetching tours:', error);
    } else {
      setTours(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    
    const { error } = await supabase.from('tours').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Tour deleted successfully' });
      fetchTours();
    }
  };

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTour(null);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldRefresh) => {
    setIsFormOpen(false);
    setEditingTour(null);
    if (shouldRefresh) fetchTours();
  };
  
  const toggleFeatured = async (tour, currentValue) => {
     if (!currentValue) {
         const featuredCount = tours.filter(t => t.is_featured).length;
         if (featuredCount >= 4) {
             toast({ variant: "destructive", title: "Limit Reached", description: "Maximum 4 featured tours allowed." });
             return;
         }
     }

     const { error } = await supabase.from('tours').update({ is_featured: !currentValue }).eq('id', tour.id);
     if (error) {
         toast({ variant: "destructive", title: "Error", description: "Failed to update featured status" });
     } else {
         fetchTours();
     }
  };

  const saveNewOrder = async (newOrder) => {
    setIsSavingOrder(true);
    try {
        // FIX: Use individual updates instead of upsert to avoid NOT NULL constraint violations
        // on columns like 'name_en' which are not present in the update payload.
        const promises = newOrder.map((tour, index) => 
            supabase
                .from('tours')
                .update({ display_order: index + 1 })
                .eq('id', tour.id)
        );
        
        await Promise.all(promises);
        
        // Update local display_order visually without full refetch if possible
        const updatedTours = newOrder.map((t, i) => ({ ...t, display_order: i + 1 }));
        setTours(updatedTours);
        
        toast({ title: "Order Saved", className: "bg-green-50" });
    } catch (error) {
        console.error('Failed to save order', error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save new order" });
    } finally {
        setIsSavingOrder(false);
    }
  };

  const handleReorder = (newOrder) => {
    // Update local state immediately for smooth drag
    setTours(newOrder);

    // Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
        saveNewOrder(newOrder);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
            {isSavingOrder ? <span className="text-orange-500 animate-pulse">Saving order...</span> : "Drag rows to reorder tours"}
        </div>
        <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Add New Tour
        </Button>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Title (EN)</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          {loading ? (
             <TableBody>
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
             </TableBody>
          ) : tours.length === 0 ? (
             <TableBody>
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">No tours found.</TableCell>
                </TableRow>
             </TableBody>
          ) : (
             <Reorder.Group as="tbody" axis="y" values={tours} onReorder={handleReorder} className="[&_tr]:border-b">
                {tours.map((tour) => (
                  <DraggableRow 
                     key={tour.id} 
                     tour={tour} 
                     onToggleFeatured={toggleFeatured}
                     onEdit={handleEdit}
                     onDelete={handleDelete}
                  />
                ))}
             </Reorder.Group>
          )}
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           {isFormOpen && (
               <TourForm tour={editingTour} onClose={handleFormClose} />
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToursTable;