import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

const ToursManagement = () => {
  const { toast } = useToast();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  const [formData, setFormData] = useState({
    name_en: '',
    duration_days: 1,
    price_per_person: 0,
    image_url: '',
    description_en: '',
    is_active: true,
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setTours(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { 
      ...formData,
      price_per_person: Number(formData.price_per_person),
      duration_days: Number(formData.duration_days),
    };

    let error;
    if (editingTour) {
      const { error: updateError } = await supabase.from('tours').update(payload).eq('id', editingTour.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('tours').insert(payload);
      error = insertError;
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: `Tour ${editingTour ? 'updated' : 'created'}` });
      setIsDialogOpen(false);
      setEditingTour(null);
      setFormData({ name_en: '', duration_days: 1, price_per_person: 0, image_url: '', description_en: '', is_active: true });
      fetchTours();
    }
  };

  const handleDelete = async (tourId, title) => {
    if (!window.confirm(`Delete tour "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('tours').delete().eq('id', tourId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Tour Deleted', description: `"${title}" has been removed.` });
      fetchTours();
    }
  };

  const openEdit = (tour) => {
    setEditingTour(tour);
    setFormData({
      name_en: tour.name_en || tour.title_en || '',
      duration_days: tour.duration_days,
      price_per_person: tour.price_per_person || tour.price || 0,
      image_url: tour.image_url || tour.main_image || '',
      description_en: tour.description_en || '',
      is_active: tour.is_active ?? tour.active ?? true,
    });
    setIsDialogOpen(true);
  };

  if (loading) return <div>Loading tours...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tour Packages</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTour(null); setFormData({ name_en: '', duration_days: 1, price_per_person: 0, image_url: '', description_en: '', is_active: true }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTour ? 'Edit Tour' : 'Create New Tour'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tour Name (EN)</Label>
                  <Input required value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
                </div>
                <div>
                  <Label>Price Per Person (GEL)</Label>
                  <Input type="number" required value={formData.price_per_person} onChange={e => setFormData({...formData, price_per_person: e.target.value})} />
                </div>
                <div>
                  <Label>Duration (Days)</Label>
                  <Input type="number" required value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Description (EN)</Label>
                <Textarea rows={4} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                <Label>Active</Label>
              </div>
              <Button type="submit" className="w-full bg-green-600">Save Tour</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map(tour => (
          <Card key={tour.id} className="overflow-hidden">
            <div className="h-48 bg-gray-200">
              <img src={tour.image_url || tour.main_image || 'https://placehold.co/600x400'} alt={tour.name_en || tour.title_en} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{tour.name_en || tour.title_en}</h3>
                <span className="font-bold text-green-600">₾{tour.price_per_person || tour.price || 0}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tour.description_en}</p>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(tour)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleDelete(tour.id, tour.name_en || tour.title_en)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToursManagement;