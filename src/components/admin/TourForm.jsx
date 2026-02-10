import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/currencyUtils';

const TourForm = ({ tour, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_en: tour?.name_en || '',
    name_ka: tour?.name_ka || '',
    name_ru: tour?.name_ru || '',
    description_en: tour?.description_en || '',
    description_ka: tour?.description_ka || '',
    description_ru: tour?.description_ru || '',
    duration_days: tour?.duration_days || 1,
    price_per_person: tour?.price_per_person || 0,
    rating: tour?.rating || 5,
    reviews_count: tour?.reviews_count || 0,
    image_url: tour?.image_url || '',
    gallery_images: tour?.gallery_images || [],
    what_included: tour?.what_included || [],
    what_to_bring: tour?.what_to_bring || [],
    best_time_to_visit: tour?.best_time_to_visit || [],
    is_active: tour?.is_active ?? true,
    is_featured: tour?.is_featured ?? false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
          ...formData,
          what_included: typeof formData.what_included === 'string' ? formData.what_included.split(',').map(s=>s.trim()) : formData.what_included,
          what_to_bring: typeof formData.what_to_bring === 'string' ? formData.what_to_bring.split(',').map(s=>s.trim()) : formData.what_to_bring,
          best_time_to_visit: typeof formData.best_time_to_visit === 'string' ? formData.best_time_to_visit.split(',').map(s=>s.trim()) : formData.best_time_to_visit,
      };

      if (tour?.id) {
        const { error } = await supabase.from('tours').update(payload).eq('id', tour.id);
        if (error) throw error;
        toast({ title: "Success", description: "Tour updated successfully" });
      } else {
        const { error } = await supabase.from('tours').insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "Tour created successfully" });
      }
      onClose(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-lg font-bold">{tour ? 'Edit Tour Basic Info' : 'Create New Tour'}</h2>
        <Button variant="ghost" onClick={() => onClose(false)}>Close</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="english" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="georgian">🇬🇪 Georgian</TabsTrigger>
            <TabsTrigger value="russian">🇷🇺 Russian</TabsTrigger>
          </TabsList>
          
          <TabsContent value="english" className="space-y-4 pt-4">
            <div>
              <Label>Name (EN)</Label>
              <Input required value={formData.name_en} onChange={e => handleChange('name_en', e.target.value)} />
            </div>
            <div>
              <Label>Description (EN)</Label>
              <Textarea rows={4} value={formData.description_en} onChange={e => handleChange('description_en', e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="georgian" className="space-y-4 pt-4">
            <div>
              <Label>Name (KA)</Label>
              <Input value={formData.name_ka} onChange={e => handleChange('name_ka', e.target.value)} />
            </div>
            <div>
              <Label>Description (KA)</Label>
              <Textarea rows={4} value={formData.description_ka} onChange={e => handleChange('description_ka', e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="russian" className="space-y-4 pt-4">
            <div>
              <Label>Name (RU)</Label>
              <Input value={formData.name_ru} onChange={e => handleChange('name_ru', e.target.value)} />
            </div>
            <div>
              <Label>Description (RU)</Label>
              <Textarea rows={4} value={formData.description_ru} onChange={e => handleChange('description_ru', e.target.value)} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
               <div>
                  <Label>Duration (Days)</Label>
                  <Input type="number" required min="1" value={formData.duration_days} onChange={e => handleChange('duration_days', e.target.value)} />
               </div>
               <div>
                  <Label>Base Price (GEL)</Label>
                  <div className="flex items-center gap-2">
                      <Input type="number" required min="0" value={formData.price_per_person} onChange={e => handleChange('price_per_person', e.target.value)} />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formData.price_per_person ? formatPrice(formData.price_per_person).split(' ')[2] : ''}
                      </span>
                  </div>
               </div>
               <div>
                   <Label>Main Image URL</Label>
                   <Input value={formData.image_url} onChange={e => handleChange('image_url', e.target.value)} />
               </div>
           </div>
           
           <div className="space-y-4">
               <div>
                  <Label>What's Included (Legacy / Comma separated)</Label>
                  <Textarea value={Array.isArray(formData.what_included) ? formData.what_included.join(', ') : formData.what_included} onChange={e => handleChange('what_included', e.target.value)} />
                  <p className="text-xs text-gray-500">For detailed management use the Tour Details page</p>
               </div>
               
               <div className="pt-4 space-y-4">
                   <div className="flex items-center gap-2">
                       <Switch checked={formData.is_active} onCheckedChange={checked => handleChange('is_active', checked)} />
                       <Label>Active Status</Label>
                   </div>
                   <div className="flex items-center gap-2">
                       <Switch checked={formData.is_featured} onCheckedChange={checked => handleChange('is_featured', checked)} />
                       <Label className="flex items-center gap-1">
                           Featured Tour <span className="text-yellow-500 text-xs">(Shows on Home)</span>
                       </Label>
                   </div>
               </div>
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;