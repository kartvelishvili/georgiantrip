import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

const PricingManagement = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const [testDist, setTestDist] = useState(100);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    const { data, error } = await supabase.from('admin_settings').select('*').maybeSingle();
    if (!error && data) {
        setSettings(data);
        setFormData(data);
    } else if (!data) {
        const defaultSettings = {
            base_rate_per_km: 1.5,
            multiplier_0_50km: 1.5,
            multiplier_50_100km: 1.3,
            multiplier_100_200km: 1.2,
            multiplier_200_plus_km: 1.0,
            max_price_per_km: 5.0,
            min_fare: 30,
            driver_price_override_enabled: false,
            default_admin_commission: 30,
            default_driver_commission: 70
        };
        setSettings(defaultSettings);
        setFormData(defaultSettings);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let error;
    if (formData.id) {
      // Update existing row
      ({ error } = await supabase.from('admin_settings').update(formData).eq('id', formData.id));
    } else {
      // Insert new row
      ({ error } = await supabase.from('admin_settings').insert(formData));
    }

    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
        toast({ title: 'Success', description: 'Settings updated' });
        fetchSettings();
    }
  };

  const calculatePreview = () => {
      const base = parseFloat(formData.base_rate_per_km) || 0;
      let mult = 1.0;
      if (testDist <= 50) mult = parseFloat(formData.multiplier_0_50km) || 1;
      else if (testDist <= 100) mult = parseFloat(formData.multiplier_50_100km) || 1;
      else if (testDist <= 200) mult = parseFloat(formData.multiplier_100_200km) || 1;
      else mult = parseFloat(formData.multiplier_200_plus_km) || 1;

      let total = testDist * base * mult;
      if (formData.min_fare) total = Math.max(total, parseFloat(formData.min_fare));
      
      return Math.round(total);
  };

  if (!settings) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Global Pricing Settings</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <Label className="mb-0 cursor-pointer" htmlFor="override-switch">Allow Driver Override</Label>
                            <p className="text-xs text-gray-500">Drivers can set their own base rates</p>
                        </div>
                        <Switch 
                            id="override-switch"
                            checked={formData.driver_price_override_enabled || false} 
                            onCheckedChange={(checked) => setFormData({...formData, driver_price_override_enabled: checked})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Base Price (₾/km)</Label><Input type="number" step="0.1" value={formData.base_rate_per_km || ''} onChange={e => setFormData({...formData, base_rate_per_km: e.target.value})} /></div>
                        <div><Label>Min Fare (₾)</Label><Input type="number" value={formData.min_fare || ''} onChange={e => setFormData({...formData, min_fare: e.target.value})} /></div>
                        <div><Label>Max Price Cap (₾/km)</Label><Input type="number" step="0.1" value={formData.max_price_per_km || ''} onChange={e => setFormData({...formData, max_price_per_km: e.target.value})} /></div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Distance Multipliers</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>0-50 km</Label><Input type="number" step="0.1" value={formData.multiplier_0_50km || ''} onChange={e => setFormData({...formData, multiplier_0_50km: e.target.value})} /></div>
                            <div><Label>50-100 km</Label><Input type="number" step="0.1" value={formData.multiplier_50_100km || ''} onChange={e => setFormData({...formData, multiplier_50_100km: e.target.value})} /></div>
                            <div><Label>100-200 km</Label><Input type="number" step="0.1" value={formData.multiplier_100_200km || ''} onChange={e => setFormData({...formData, multiplier_100_200km: e.target.value})} /></div>
                            <div><Label>200+ km</Label><Input type="number" step="0.1" value={formData.multiplier_200_plus_km || ''} onChange={e => setFormData({...formData, multiplier_200_plus_km: e.target.value})} /></div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Save Global Settings</Button>
                </form>
            </Card>
        </div>

        <div>
            <Card className="p-6 sticky top-6">
                <h3 className="font-bold text-lg mb-4">Price Calculator</h3>
                <div className="mb-4">
                    <Label>Test Distance (km)</Label>
                    <Input type="number" value={testDist} onChange={e => setTestDist(Number(e.target.value))} />
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between"><span>Customer Price:</span> <span className="font-bold text-lg">₾{calculatePreview()}</span></div>
                    <div className="flex justify-between text-sm text-gray-500"><span>Commission ({formData.default_admin_commission || 30}%):</span> <span>₾{(calculatePreview() * (formData.default_admin_commission || 30) / 100).toFixed(1)}</span></div>
                    <div className="flex justify-between text-sm text-green-700 font-bold"><span>Driver Earns ({formData.default_driver_commission || 70}%):</span> <span>₾{(calculatePreview() * (formData.default_driver_commission || 70) / 100).toFixed(1)}</span></div>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default PricingManagement;