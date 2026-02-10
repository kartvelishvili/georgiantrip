import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SmsApiConfig = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKey = async () => {
      const { data } = await supabase.from('sms_settings').select('id, api_key').single();
      if (data) {
        setApiKey(data.api_key);
        setSettingsId(data.id);
      }
      setLoading(false);
    };
    fetchKey();
  }, []);

  const saveApiKey = async () => {
    const { error } = await supabase
      .from('sms_settings')
      .update({ api_key: apiKey })
      .eq('id', settingsId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Saved', description: 'API Key updated successfully' });
    }
  };

  return (
    <Card className="p-6 max-w-xl">
       <h3 className="font-bold text-lg mb-4">SMS Office Configuration</h3>
       <div className="space-y-4">
          <div className="space-y-2">
             <Label>API Key</Label>
             <div className="flex gap-2">
                <Input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter SMS Office API Key"
                  disabled={loading}
                />
                <Button onClick={saveApiKey} disabled={loading}>Save</Button>
             </div>
             <p className="text-xs text-gray-500">Key from smsoffice.ge integration page</p>
          </div>
          <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700">Sender Name: <span className="font-bold">Georgiantrip</span></p>
          </div>
       </div>
    </Card>
  );
};

export default SmsApiConfig;