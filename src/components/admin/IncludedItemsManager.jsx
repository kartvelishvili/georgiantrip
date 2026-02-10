import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, X, Check } from 'lucide-react';
import { updateTourDetails } from '@/lib/tourDetailService';
import { useToast } from '@/components/ui/use-toast';

const IncludedItemsManager = ({ tour, onUpdate, type = 'included' }) => { // type: 'included' or 'bring'
  const { toast } = useToast();
  const fieldName = type === 'included' ? 'what_included' : 'what_to_bring';
  const title = type === 'included' ? "What's Included" : "What to Bring";
  
  // DB stores as text array for now based on original schema, but let's try to support objects if JSONB or just simple strings
  // User prompt mentions "Title, Description, Icon". This implies JSON structure.
  // Original schema was text[]. If it's text[], we can only store strings. 
  // Let's assume we can migrate or it's just strings for now to be safe with existing schema provided in prompt.
  // Prompt says "what_included (text array) - already exists".
  // So we strictly use Strings. We can format it like "Title: Description" or just "Title".
  // Let's stick to strings to avoid breaking schema.
  
  const [items, setItems] = useState(tour[fieldName] || []);
  const [newItem, setNewItem] = useState('');

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const updatedItems = [...items, newItem.trim()];
    setItems(updatedItems);
    setNewItem('');

    try {
        await updateTourDetails(tour.id, { [fieldName]: updatedItems });
        onUpdate({ ...tour, [fieldName]: updatedItems });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update" });
    }
  };

  const handleRemoveItem = async (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    try {
        await updateTourDetails(tour.id, { [fieldName]: updatedItems });
        onUpdate({ ...tour, [fieldName]: updatedItems });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update" });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <Input 
            placeholder="Add new item..." 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
        />
        <Button type="submit" size="icon" className="shrink-0 bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-md group">
                <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                </div>
                <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                </button>
            </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No items added yet.</p>}
      </div>
    </Card>
  );
};

export default IncludedItemsManager;