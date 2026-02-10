import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const SmsTemplates = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    driver_sms_template: '',
    admin_sms_template: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('sms_settings').select('*').single();
    if (data) setSettings(data);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('sms_settings')
      .update({
        driver_sms_template: settings.driver_sms_template,
        admin_sms_template: settings.admin_sms_template
      })
      .eq('id', settings.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Saved', description: 'Templates updated successfully' });
    }
  };

  const variables = [
    '{driverName}', '{passengerName}', '{passengerPhone}', 
    '{fromLocation}', '{toLocation}', '{date}', '{time}', 
    '{bookingId}', '{carModel}', '{price}'
  ];

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
        <p className="font-bold mb-2">Available Variables:</p>
        <div className="flex flex-wrap gap-2">
          {variables.map(v => (
            <code key={v} className="bg-white px-2 py-1 rounded border border-blue-100">{v}</code>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Driver SMS Template</Label>
          <Textarea 
            value={settings.driver_sms_template || ''}
            onChange={(e) => setSettings({...settings, driver_sms_template: e.target.value})}
            className="h-32 font-mono text-sm"
          />
          <p className="text-xs text-gray-500">Sent to driver immediately after booking.</p>
        </div>

        <div className="space-y-2">
          <Label>Admin SMS Template</Label>
          <Textarea 
             value={settings.admin_sms_template || ''}
             onChange={(e) => setSettings({...settings, admin_sms_template: e.target.value})}
             className="h-32 font-mono text-sm"
          />
          <p className="text-xs text-gray-500">Sent to admin numbers immediately after booking.</p>
        </div>

        <Button onClick={handleSave} className="bg-green-600">
          <Save className="w-4 h-4 mr-2" /> Save Templates
        </Button>
      </div>
    </div>
  );
};

export default SmsTemplates;