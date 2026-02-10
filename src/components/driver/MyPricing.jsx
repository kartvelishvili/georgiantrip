import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, Save, Info } from 'lucide-react';

const MyPricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [globalSettings, setGlobalSettings] = useState(null);
  const [adminCommissionPercent, setAdminCommissionPercent] = useState(30);
  const [driverPricing, setDriverPricing] = useState({
      base_rate_per_km: 0,
      multiplier_200_plus: 1.0,
      custom_multipliers: {}
  });
  const [driverId, setDriverId] = useState(null);

  // Calculator
  const [calcDistance, setCalcDistance] = useState(100);
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Get Global Settings from admin_settings (unified pricing table)
    const { data: settings } = await supabase.from('admin_settings').select('*').maybeSingle();
    setGlobalSettings(settings);

    // Commission is already in admin_settings
    if (settings?.default_admin_commission) {
      setAdminCommissionPercent(Number(settings.default_admin_commission));
    }

    // 2. Get Driver - Use maybeSingle to avoid crash if profile doesn't exist yet
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', user.id).maybeSingle();
    if (driver) {
        setDriverId(driver.id);
        // 3. Get Driver Pricing
        const { data: pricing } = await supabase.from('driver_pricing').select('*').eq('driver_id', driver.id).maybeSingle();
        
        if (pricing) {
            setDriverPricing({
                base_rate_per_km: pricing.base_rate_per_km,
                multiplier_200_plus: pricing.multiplier_200_plus || 1.0,
                custom_multipliers: pricing.custom_multipliers || {}
            });
        } else if (settings) {
            // Default to global if no custom pricing yet
            setDriverPricing({
                base_rate_per_km: settings.base_rate_per_km,
                multiplier_200_plus: settings.multiplier_200_plus_km || 1.0,
                custom_multipliers: {}
            });
        }
    }
    setLoading(false);
  };

  const calculatePrice = (distance) => {
      if (!globalSettings) return null;

      const baseRate = globalSettings.driver_price_override_enabled ? driverPricing.base_rate_per_km : globalSettings.base_rate_per_km;
      
      // Safety check for baseRate
      if (baseRate === undefined || baseRate === null) return null;

      let multiplier = 1.0;

      if (distance <= 50) multiplier = globalSettings.multiplier_0_50km;
      else if (distance <= 100) multiplier = globalSettings.multiplier_50_100km;
      else if (distance <= 200) multiplier = globalSettings.multiplier_100_200km;
      else multiplier = globalSettings.driver_price_override_enabled ? driverPricing.multiplier_200_plus : globalSettings.multiplier_200_plus_km;

      let subtotal = distance * baseRate * multiplier;
      const minFare = globalSettings.min_fare || 0;
      const isMinFare = subtotal < minFare;
      const finalPrice = Math.max(subtotal, minFare);
      
      const commission = finalPrice * (adminCommissionPercent / 100);
      const driverNet = finalPrice * ((100 - adminCommissionPercent) / 100);

      return {
          distance,
          baseRate,
          multiplier,
          subtotal,
          minFareApplied: isMinFare,
          finalPrice,
          commission,
          driverNet
      };
  };

  useEffect(() => {
      if (!loading && globalSettings) {
          setCalcResult(calculatePrice(calcDistance));
      }
  }, [calcDistance, driverPricing, globalSettings, loading, adminCommissionPercent]);

  const handleSave = async () => {
      if (!driverId) {
          toast({ variant: 'destructive', title: 'Error', description: 'Driver profile not found.' });
          return;
      }

      setSaving(true);
      
      // Validation
      if (globalSettings && driverPricing.base_rate_per_km > globalSettings.max_price_per_km) {
          toast({ variant: 'destructive', title: 'Price Too High', description: `Max allowed base rate is ₾${globalSettings.max_price_per_km}` });
          setSaving(false);
          return;
      }

      const { error } = await supabase.from('driver_pricing').upsert({
          driver_id: driverId,
          base_rate_per_km: driverPricing.base_rate_per_km,
          multiplier_200_plus: driverPricing.multiplier_200_plus,
          updated_at: new Date()
      }, { onConflict: 'driver_id' });

      if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
          toast({ title: 'Pricing Updated', description: 'Your custom rates are saved.' });
      }
      setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading pricing...</div>;
  
  if (!globalSettings) {
      return (
          <div className="p-8 text-center border-2 border-dashed rounded-lg bg-gray-50">
              <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">System Configuration Missing</h3>
              <p className="text-gray-500 mt-1">Pricing settings have not been configured by the administrator yet.</p>
          </div>
      );
  }

  const isCustomEnabled = globalSettings?.driver_price_override_enabled;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Pricing Management</h1>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant={isCustomEnabled ? "default" : "secondary"} className={isCustomEnabled ? "bg-green-600" : "bg-gray-500"}>
                        {isCustomEnabled ? "Custom Pricing Enabled" : "Global Pricing Active"}
                    </Badge>
                </div>
                
                {!isCustomEnabled && (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex gap-3 text-sm mb-6 border border-yellow-100">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p>Pricing is currently controlled by the platform administrator to ensure consistency. You cannot modify these rates.</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <Label>Base Rate per KM (₾)</Label>
                        <Input 
                            type="number" 
                            step="0.1"
                            value={driverPricing.base_rate_per_km}
                            onChange={e => setDriverPricing({...driverPricing, base_rate_per_km: parseFloat(e.target.value)})}
                            disabled={!isCustomEnabled}
                        />
                        {isCustomEnabled && <p className="text-xs text-gray-500 mt-1">Max allowed: ₾{globalSettings.max_price_per_km}</p>}
                    </div>

                    <div>
                        <Label>Long Distance Multiplier (200km+)</Label>
                        <Input 
                            type="number" 
                            step="0.1"
                            value={driverPricing.multiplier_200_plus}
                            onChange={e => setDriverPricing({...driverPricing, multiplier_200_plus: parseFloat(e.target.value)})}
                            disabled={!isCustomEnabled}
                        />
                         <p className="text-xs text-gray-500 mt-1">Applies for trips longer than 200km</p>
                    </div>

                    {isCustomEnabled && (
                        <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 mt-4">
                            {saving ? 'Saving...' : 'Save Changes'} <Save className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </Card>

            <Card className="p-6 bg-gray-50 border-dashed">
                <h3 className="font-bold text-gray-900 mb-4">Current Rate Multipliers</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>0 - 50 km</span> <span className="font-mono bg-white px-2 rounded">x{globalSettings.multiplier_0_50km}</span></div>
                    <div className="flex justify-between"><span>50 - 100 km</span> <span className="font-mono bg-white px-2 rounded">x{globalSettings.multiplier_50_100km}</span></div>
                    <div className="flex justify-between"><span>100 - 200 km</span> <span className="font-mono bg-white px-2 rounded">x{globalSettings.multiplier_100_200km}</span></div>
                    <div className="flex justify-between font-bold text-green-700"><span>200+ km</span> <span className="font-mono bg-white px-2 rounded">x{isCustomEnabled ? driverPricing.multiplier_200_plus : globalSettings.multiplier_200_plus_km}</span></div>
                </div>
            </Card>
        </div>

        <div>
            <Card className="p-6 h-full sticky top-6 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900">
                    <Calculator className="w-6 h-6 text-blue-500" />
                    Income Calculator
                </div>

                <div className="mb-6">
                    <Label>Test Trip Distance (km)</Label>
                    <div className="flex gap-4">
                        <Input 
                            type="number" 
                            value={calcDistance} 
                            onChange={e => setCalcDistance(parseFloat(e.target.value))} 
                        />
                        <div className="flex-shrink-0 flex items-center text-sm text-gray-500">km</div>
                    </div>
                </div>

                {calcResult ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between"><span>Base Rate:</span> <span>₾{calcResult.baseRate?.toFixed(2)} /km</span></div>
                            <div className="flex justify-between"><span>Distance Multiplier:</span> <span>x{calcResult.multiplier}</span></div>
                            <div className="border-t border-blue-200 my-2 pt-2" />
                            <div className="flex justify-between font-bold"><span>Total Customer Price:</span> <span>₾{calcResult.finalPrice?.toFixed(2)}</span></div>
                            {calcResult.minFareApplied && <span className="text-xs text-blue-600 block text-right">(Min fare applied)</span>}
                        </div>

                        <div className="space-y-2">
                             <div className="flex justify-between text-sm text-gray-500">
                             <span>Platform Fee ({adminCommissionPercent}%)</span>
                                 <span>- ₾{calcResult.commission?.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-lg font-bold text-green-700 p-3 bg-green-50 rounded-lg border border-green-100">
                                 <span>Your Net Income</span>
                                 <span>₾{calcResult.driverNet?.toFixed(2)}</span>
                             </div>
                             <p className="text-xs text-gray-400 text-center mt-2">* Actual earnings may vary slightly due to rounding.</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        Enter a distance to calculate earnings
                    </div>
                )}
            </Card>
        </div>
    </div>
  );
};

export default MyPricing;