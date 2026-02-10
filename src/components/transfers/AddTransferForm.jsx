import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addTransfer } from '@/lib/transferService';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddTransferForm = ({ onSuccess }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
      from_location_id: '',
      to_location_id: '',
      distance_km: '',
      duration_minutes: '',
      base_price: '',
      image_url: '',
      name_en: ''
  });

  useEffect(() => {
     const fetchLocs = async () => {
         const { data } = await supabase.from('locations').select('*').eq('is_active', true).order('name_en');
         setLocations(data || []);
     };
     fetchLocs();
  }, []);

  // Auto-generate name
  useEffect(() => {
     if(formData.from_location_id && formData.to_location_id) {
         const from = locations.find(l => l.id === formData.from_location_id)?.name_en;
         const to = locations.find(l => l.id === formData.to_location_id)?.name_en;
         if(from && to) {
             setFormData(prev => ({...prev, name_en: `${from} - ${to}`}));
         }
     }
  }, [formData.from_location_id, formData.to_location_id, locations]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const payload = {
              ...formData,
              distance_km: parseFloat(formData.distance_km),
              duration_minutes: parseInt(formData.duration_minutes),
              base_price: parseFloat(formData.base_price),
              is_active: true,
              slug: formData.name_en.toLowerCase().replace(/ /g, '-').replace(/---/g, '-')
          };
          
          await addTransfer(payload);
          toast({ title: "Success", description: "Transfer route created." });
          onSuccess();
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
          setLoading(false);
      }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>From</Label>
                  <Select onValueChange={(val) => setFormData({...formData, from_location_id: val})}>
                      <SelectTrigger><SelectValue placeholder="Select Origin" /></SelectTrigger>
                      <SelectContent>
                          {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name_en}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label>To</Label>
                  <Select onValueChange={(val) => setFormData({...formData, to_location_id: val})}>
                      <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                      <SelectContent>
                          {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name_en}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <div className="space-y-2">
              <Label>Route Name (Auto)</Label>
              <Input value={formData.name_en} readOnly className="bg-gray-50" />
          </div>

          <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                  <Label>Distance (km)</Label>
                  <Input type="number" required onChange={(e) => setFormData({...formData, distance_km: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" required onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Base Price (GEL)</Label>
                  <Input type="number" required onChange={(e) => setFormData({...formData, base_price: e.target.value})} />
               </div>
          </div>

          <div className="space-y-2">
               <Label>Image URL (Optional)</Label>
               <Input placeholder="https://..." onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Route
          </Button>
      </form>
  );
};

export default AddTransferForm;