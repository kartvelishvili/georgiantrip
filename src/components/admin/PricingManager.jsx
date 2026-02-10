import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateTourDetails } from '@/lib/tourDetailService';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPrice } from '@/lib/currencyUtils';

const PricingManager = ({ tour, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    price_per_person: tour.price_per_person || 0,
    group_discount_percent: tour.group_discount_percent || 0,
    group_discount_min_size: tour.group_discount_min_size || 4,
    early_bird_discount_percent: tour.early_bird_discount_percent || 0,
    early_bird_deadline_days: tour.early_bird_deadline_days || 0,
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTourDetails(tour.id, data);
      onUpdate({ ...tour, ...data });
      toast({ title: "Pricing updated" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Calculations for preview
  const basePrice = data.price_per_person;
  const groupPrice = basePrice * (1 - data.group_discount_percent / 100);
  const earlyPrice = basePrice * (1 - data.early_bird_discount_percent / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Pricing Settings</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Base Price (GEL) per person</Label>
            <div className="flex items-center gap-4">
              <Input 
                  type="number" 
                  min="0"
                  value={data.price_per_person}
                  onChange={(e) => handleChange('price_per_person', e.target.value)}
                  className="text-lg font-bold"
              />
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                {formatPrice(data.price_per_person).split(' ')[2]} {/* Shows (~$X) */}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <Label className="flex items-center gap-2">
                 Group Discount (%)
                 <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger><Info className="w-3 h-3 text-gray-400" /></TooltipTrigger>
                     <TooltipContent>Discount applied for large groups</TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
               </Label>
               <Input 
                   type="number" min="0" max="100"
                   value={data.group_discount_percent}
                   onChange={(e) => handleChange('group_discount_percent', e.target.value)}
               />
            </div>
            <div>
               <Label>Min. Group Size</Label>
               <Input 
                   type="number" min="2"
                   value={data.group_discount_min_size}
                   onChange={(e) => handleChange('group_discount_min_size', e.target.value)}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <Label className="flex items-center gap-2">
                 Early Bird Discount (%)
               </Label>
               <Input 
                   type="number" min="0" max="100"
                   value={data.early_bird_discount_percent}
                   onChange={(e) => handleChange('early_bird_discount_percent', e.target.value)}
               />
            </div>
            <div>
               <Label>Days in Advance</Label>
               <Input 
                   type="number" min="0"
                   value={data.early_bird_deadline_days}
                   onChange={(e) => handleChange('early_bird_deadline_days', e.target.value)}
               />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Pricing
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-50 border-slate-200">
        <h3 className="text-lg font-semibold border-b border-slate-200 pb-2 mb-4 text-slate-700">Price Preview</h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                <span className="font-medium text-slate-600">Standard Price</span>
                <span className="font-bold text-xl text-slate-900">{formatPrice(basePrice)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                <div>
                    <span className="font-medium text-slate-600 block">Group Price</span>
                    <span className="text-xs text-slate-400">For {data.group_discount_min_size}+ people ({data.group_discount_percent}% off)</span>
                </div>
                <span className="font-bold text-xl text-green-600">{formatPrice(groupPrice)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                <div>
                    <span className="font-medium text-slate-600 block">Early Bird Price</span>
                    <span className="text-xs text-slate-400">Booked {data.early_bird_deadline_days}+ days ahead ({data.early_bird_discount_percent}% off)</span>
                </div>
                <span className="font-bold text-xl text-blue-600">{formatPrice(earlyPrice)}</span>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default PricingManager;