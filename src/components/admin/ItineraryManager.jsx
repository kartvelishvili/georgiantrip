import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Check } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { updateTourDetails } from '@/lib/tourDetailService';
import { useToast } from '@/components/ui/use-toast';

const ItineraryItem = ({ item, index, onEdit, onDelete }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
        value={item} 
        dragListener={false} 
        dragControls={controls}
        className="flex items-start gap-4 p-4 bg-white border rounded-lg shadow-sm mb-3 group"
    >
      <div 
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
        {index + 1}
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-gray-900">{item.title}</h4>
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
           {item.duration && <span>⏱ {item.duration}</span>}
           {item.meals && <span>🍽 {item.meals}</span>}
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <Button size="icon" variant="ghost" onClick={() => onEdit(item, index)}>
            <Edit className="w-4 h-4 text-blue-600" />
         </Button>
         <Button size="icon" variant="ghost" onClick={() => onDelete(index)}>
            <Trash2 className="w-4 h-4 text-red-600" />
         </Button>
      </div>
    </Reorder.Item>
  );
};

const ItineraryManager = ({ tour, onUpdate }) => {
  const { toast } = useToast();
  const [items, setItems] = useState(tour.itinerary || []); // Assuming JSONB array
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', duration: '', meals: '', accommodation: '' });

  const handleOpenDialog = (item = null, index = null) => {
    if (item) {
        setFormData(item);
        setEditingIndex(index);
    } else {
        setFormData({ title: '', description: '', duration: '', meals: '', accommodation: '' });
        setEditingIndex(null);
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
      let newItems = [...items];
      if (editingIndex !== null) {
          newItems[editingIndex] = formData;
      } else {
          newItems.push(formData);
      }

      setItems(newItems);
      setIsDialogOpen(false);
      
      try {
          await updateTourDetails(tour.id, { itinerary: newItems });
          onUpdate({ ...tour, itinerary: newItems });
          toast({ title: "Itinerary updated" });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to save itinerary" });
      }
  };

  const handleDelete = async (index) => {
      if (!window.confirm("Remove this day from itinerary?")) return;
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      try {
          await updateTourDetails(tour.id, { itinerary: newItems });
          onUpdate({ ...tour, itinerary: newItems });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete item" });
      }
  };

  const handleReorder = async (newOrder) => {
      setItems(newOrder);
      // Debounce or save immediately?
      try {
        await updateTourDetails(tour.id, { itinerary: newOrder });
        onUpdate({ ...tour, itinerary: newOrder });
      } catch (error) {
          // silent fail or toast
      }
  };

  return (
    <Card className="p-6 bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Itinerary Days</h3>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Add Day
        </Button>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={handleReorder}>
          {items.map((item, idx) => (
             <ItineraryItem 
                key={`${item.title}-${idx}`} 
                item={item} 
                index={idx} 
                onEdit={handleOpenDialog} 
                onDelete={handleDelete} 
             />
          ))}
      </Reorder.Group>
      
      {items.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">No itinerary items yet. Add day-by-day details.</div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingIndex !== null ? 'Edit Day' : 'Add New Day'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                  <div>
                      <Label>Title (e.g. "Arrival in Tbilisi")</Label>
                      <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                      <Label>Description</Label>
                      <Textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label>Duration (optional)</Label>
                          <Input placeholder="e.g. 5 hours" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                      </div>
                       <div>
                          <Label>Meals (optional)</Label>
                          <Input placeholder="e.g. Breakfast, Dinner" value={formData.meals} onChange={e => setFormData({...formData, meals: e.target.value})} />
                      </div>
                  </div>
                  <div>
                      <Label>Accommodation (optional)</Label>
                      <Input placeholder="e.g. Hotel Stamba" value={formData.accommodation} onChange={e => setFormData({...formData, accommodation: e.target.value})} />
                  </div>
                  <Button className="w-full mt-2" onClick={handleSaveItem}>Save Day</Button>
              </div>
          </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ItineraryManager;