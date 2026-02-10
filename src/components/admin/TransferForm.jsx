import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhotoUpload from '@/components/driver/PhotoUpload';

const TransferForm = ({ transfer, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  
  const [formData, setFormData] = useState({
    name_en: transfer?.name_en || '',
    name_ka: transfer?.name_ka || '',
    name_ru: transfer?.name_ru || '',
    from_location_id: transfer?.from_location_id || '',
    to_location_id: transfer?.to_location_id || '',
    distance_km: transfer?.distance_km || 0,
    duration_minutes: transfer?.duration_minutes || 0,
    base_price: transfer?.base_price || 0,
    image_url: transfer?.image_url || '',
    is_active: transfer?.is_active ?? true,
    slug: transfer?.slug || ''
  });

  useEffect(() => {
    const fetchLocs = async () => {
        const { data } = await supabase.from('locations').select('id, name_en').order('name_en');
        setLocations(data || []);
    };
    fetchLocs();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      from_location_id: formData.from_location_id === '' ? null : formData.from_location_id,
      to_location_id: formData.to_location_id === '' ? null : formData.to_location_id,
      distance_km: formData.distance_km === '' ? 0 : Number(formData.distance_km),
      duration_minutes: formData.duration_minutes === '' ? 0 : Number(formData.duration_minutes),
      base_price: formData.base_price === '' ? 0 : Number(formData.base_price),
    };

    try {
      if (transfer?.id) {
        const { error } = await supabase.from('transfers').update(payload).eq('id', transfer.id);
        if (error) throw error;
        toast({ title: "Success", description: "Transfer updated" });
      } else {
        const { error } = await supabase.from('transfers').insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "Transfer created" });
      }
      onClose(true);
    } catch (error) {
      console.error("Transfer save error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-lg font-bold">{transfer ? 'Edit Transfer' : 'Create New Transfer'}</h2>
        <Button variant="ghost" onClick={() => onClose(false)}>Close</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            <Label>Transfer Image</Label>
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <PhotoUpload 
                        bucketName="car-photos" // Reusing bucket
                        pathPrefix="transfers"
                        onUploadComplete={url => handleChange('image_url', url)}
                        className="h-40"
                    />
                </div>
                <div className="flex-1">
                    <Label className="text-xs text-gray-500 mb-1">Image URL (Manual)</Label>
                    <Input value={formData.image_url} onChange={e => handleChange('image_url', e.target.value)} placeholder="https://..." />
                    
                    {formData.image_url && (
                        <div className="mt-2 rounded-md overflow-hidden h-28 border border-gray-200">
                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        <Tabs defaultValue="english" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="english">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="georgian">🇬🇪 Georgian</TabsTrigger>
            <TabsTrigger value="russian">🇷🇺 Russian</TabsTrigger>
          </TabsList>
          
          <TabsContent value="english" className="pt-4"><Input placeholder="Route Name (e.g. Tbilisi to Batumi)" value={formData.name_en} onChange={e => handleChange('name_en', e.target.value)} /></TabsContent>
          <TabsContent value="georgian" className="pt-4"><Input placeholder="მარშრუტის სახელი" value={formData.name_ka} onChange={e => handleChange('name_ka', e.target.value)} /></TabsContent>
          <TabsContent value="russian" className="pt-4"><Input placeholder="Название маршрута" value={formData.name_ru} onChange={e => handleChange('name_ru', e.target.value)} /></TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>From</Label>
                <Select value={formData.from_location_id} onValueChange={v => handleChange('from_location_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                        {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name_en}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>To</Label>
                <Select value={formData.to_location_id} onValueChange={v => handleChange('to_location_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                        {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name_en}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Distance (km)</Label>
                <Input type="number" value={formData.distance_km} onChange={e => handleChange('distance_km', e.target.value)} />
            </div>
            <div>
                <Label>Duration (min)</Label>
                <Input type="number" value={formData.duration_minutes} onChange={e => handleChange('duration_minutes', e.target.value)} />
            </div>
            <div>
                <Label>Base Price (GEL)</Label>
                <Input type="number" value={formData.base_price} onChange={e => handleChange('base_price', e.target.value)} />
            </div>
            <div>
                <Label>Slug (URL)</Label>
                <Input value={formData.slug} onChange={e => handleChange('slug', e.target.value)} />
            </div>
        </div>
        
        <div className="flex items-center gap-2">
             <Switch checked={formData.is_active} onCheckedChange={c => handleChange('is_active', c)} />
             <Label>Active Status</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Save Transfer'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;