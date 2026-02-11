import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save, Shield, Instagram } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
      default_driver_commission: 70,
      default_admin_commission: 30,
      base_rate_per_km: 1.5,
      min_fare: 50,
      multiplier_0_50km: 1.5,
      multiplier_50_100km: 1.3,
      multiplier_100_200km: 1.2,
      multiplier_200_plus_km: 1.0,
      driver_price_override_enabled: true,
      max_price_per_km: 5.0
  });

  useEffect(() => {
     fetchSettings();
  }, []);

  const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*').maybeSingle();
      if(data) setSettings(data);
  };

  const handleSave = async () => {
     // Ensure we have an id for upsert conflict resolution
     const payload = { ...settings };
     if (!payload.id) {
       // If no existing row, insert fresh
       const { error } = await supabase.from('admin_settings').insert(payload);
       if (error) {
         toast({ variant: 'destructive', title: 'Error', description: error.message });
       } else {
         toast({ title: 'Success', description: 'Settings created successfully' });
         fetchSettings();
       }
     } else {
       const { error } = await supabase.from('admin_settings').update(payload).eq('id', payload.id);
       if (error) {
         toast({ variant: 'destructive', title: 'Error', description: error.message });
       } else {
         toast({ title: 'Success', description: 'Settings updated successfully' });
       }
     }
  };

  return (
     <div className="space-y-6 max-w-4xl">
         <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
         
         <Card className="p-6">
             <h3 className="font-bold text-lg mb-4">Commission Settings</h3>
             <div className="grid grid-cols-2 gap-6">
                 <div>
                     <Label>Admin Commission (%)</Label>
                     <Input 
                        type="number" 
                        value={settings.default_admin_commission} 
                        onChange={e => {
                          const adminVal = Number(e.target.value);
                          setSettings({...settings, default_admin_commission: adminVal, default_driver_commission: 100 - adminVal});
                        }}
                     />
                 </div>
                 <div>
                     <Label>Driver Commission (%)</Label>
                     <Input 
                        type="number" 
                        value={settings.default_driver_commission} 
                        disabled
                        className="bg-gray-50"
                     />
                     <p className="text-xs text-gray-500 mt-1">Auto-calculated: 100% − Admin Commission</p>
                 </div>
             </div>
         </Card>

         <Card className="p-6">
             <h3 className="font-bold text-lg mb-4">Driver Pricing Controls</h3>
             <div className="grid grid-cols-2 gap-6">
                 <div>
                     <Label>Allow Driver Custom Pricing</Label>
                     <div className="flex items-center gap-3 mt-2">
                         <Button 
                           variant={settings.driver_price_override_enabled ? "default" : "outline"} 
                           size="sm" 
                           className={settings.driver_price_override_enabled ? "bg-green-600 hover:bg-green-700" : ""}
                           onClick={() => setSettings({...settings, driver_price_override_enabled: true})}
                         >
                           <Shield className="w-4 h-4 mr-1" /> Enabled
                         </Button>
                         <Button 
                           variant={!settings.driver_price_override_enabled ? "default" : "outline"} 
                           size="sm"
                           className={!settings.driver_price_override_enabled ? "bg-red-600 hover:bg-red-700" : ""}
                           onClick={() => setSettings({...settings, driver_price_override_enabled: false})}
                         >
                           Disabled
                         </Button>
                     </div>
                     <p className="text-xs text-gray-500 mt-1">When disabled, all drivers use global pricing</p>
                 </div>
                 <div>
                     <Label>Max Driver Rate (₾/km)</Label>
                     <Input 
                        type="number" step="0.5"
                        value={settings.max_price_per_km} 
                        onChange={e => setSettings({...settings, max_price_per_km: e.target.value})}
                     />
                     <p className="text-xs text-gray-500 mt-1">Safety cap — drivers cannot exceed this rate</p>
                 </div>
             </div>
         </Card>

         <Card className="p-6">
             <h3 className="font-bold text-lg mb-4">Global Pricing Defaults</h3>
             <div className="grid grid-cols-2 gap-6 mb-4">
                 <div>
                     <Label>Base Rate (₾/km)</Label>
                     <Input 
                        type="number" step="0.1"
                        value={settings.base_rate_per_km} 
                        onChange={e => setSettings({...settings, base_rate_per_km: e.target.value})}
                     />
                 </div>
                 <div>
                     <Label>Minimum Fare (₾)</Label>
                     <Input 
                        type="number" 
                        value={settings.min_fare} 
                        onChange={e => setSettings({...settings, min_fare: e.target.value})}
                     />
                 </div>
             </div>
             
             <Label className="block mb-2 mt-6">Distance Multipliers</Label>
             <div className="grid grid-cols-4 gap-4">
                 <div>
                     <Label className="text-xs text-gray-500">0 - 50 km</Label>
                     <Input 
                        type="number" step="0.1"
                        value={settings.multiplier_0_50km} 
                        onChange={e => setSettings({...settings, multiplier_0_50km: e.target.value})}
                     />
                 </div>
                 <div>
                     <Label className="text-xs text-gray-500">50 - 100 km</Label>
                     <Input 
                        type="number" step="0.1"
                        value={settings.multiplier_50_100km} 
                        onChange={e => setSettings({...settings, multiplier_50_100km: e.target.value})}
                     />
                 </div>
                 <div>
                     <Label className="text-xs text-gray-500">100 - 200 km</Label>
                     <Input 
                        type="number" step="0.1"
                        value={settings.multiplier_100_200km} 
                        onChange={e => setSettings({...settings, multiplier_100_200km: e.target.value})}
                     />
                 </div>
                 <div>
                     <Label className="text-xs text-gray-500">200+ km</Label>
                     <Input 
                        type="number" step="0.1"
                        value={settings.multiplier_200_plus_km} 
                        onChange={e => setSettings({...settings, multiplier_200_plus_km: e.target.value})}
                     />
                 </div>
             </div>
         </Card>

         <Card className="p-6">
             <div className="flex items-center gap-2 mb-4">
                 <Instagram className="w-5 h-5 text-pink-500" />
                 <h3 className="font-bold text-lg">Instagram Integration</h3>
             </div>
             <div className="space-y-3">
                 <div>
                     <Label>Instagram Access Token</Label>
                     <Input 
                        type="password"
                        placeholder="Paste your long-lived Instagram access token..."
                        value={settings.instagram_access_token || ''} 
                        onChange={e => setSettings({...settings, instagram_access_token: e.target.value})}
                     />
                     <p className="text-xs text-gray-500 mt-1">
                       Get a token from the <a href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started" target="_blank" rel="noreferrer" className="text-blue-600 underline">Meta Developer Portal</a>. 
                       This enables the homepage Instagram feed to show real posts from @georgiantrip_go.
                     </p>
                 </div>
             </div>
         </Card>

         <Button onClick={handleSave} className="bg-green-600 w-full md:w-auto">
             <Save className="w-4 h-4 mr-2" /> Save All Changes
         </Button>
     </div>
  );
};

export default AdminSettings;