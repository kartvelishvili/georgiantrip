import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Phone, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validatePhoneNumber } from '@/lib/smsService';

const AdminPhoneNumbers = () => {
  const { toast } = useToast();
  const [phones, setPhones] = useState([]);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    const { data } = await supabase.from('admin_phone_numbers').select('*').order('created_at');
    if (data) setPhones(data);
  };

  const handleAdd = async () => {
    if (!newPhone) return;

    // Basic validation
    let formatted = newPhone.replace(/\D/g, '');
    if (formatted.length === 9) formatted = '995' + formatted;
    
    // Check if valid Georgian number (12 digits starting with 995)
    if (formatted.length !== 12 || !formatted.startsWith('995')) {
       toast({
         variant: "destructive",
         title: "Invalid Format",
         description: "Please use Georgian format (e.g., 599 123 456)"
       });
       return;
    }

    setLoading(true);
    const { error } = await supabase.from('admin_phone_numbers').insert({
      phone_number: formatted,
      is_primary: phones.length === 0 // First one is primary by default
    });

    setLoading(false);
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setNewPhone('');
      fetchPhones();
      toast({ title: "Success", description: "Phone number added" });
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('admin_phone_numbers').delete().eq('id', id);
    if (!error) {
      setPhones(phones.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Phone number removed" });
    }
  };

  const togglePrimary = async (id) => {
    // 1. Set all to false
    await supabase.from('admin_phone_numbers').update({ is_primary: false }).gt('created_at', '2000-01-01');
    
    // 2. Set target to true
    await supabase.from('admin_phone_numbers').update({ is_primary: true }).eq('id', id);
    
    fetchPhones();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label>Add Admin Phone Number</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="599 123 456"
                className="pl-9"
              />
            </div>
            <Button onClick={handleAdd} disabled={loading} className="bg-green-600">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          <p className="text-xs text-gray-500">Enter local format (9 digits) or with country code</p>
        </div>
      </div>

      <div className="grid gap-4">
        {phones.map((phone) => (
          <Card key={phone.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${phone.is_primary ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">+{phone.phone_number}</p>
                {phone.is_primary && <span className="text-xs text-yellow-600 font-medium">Primary Contact</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!phone.is_primary && (
                <Button variant="ghost" size="sm" onClick={() => togglePrimary(phone.id)} title="Set as Primary">
                   <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleDelete(phone.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {phones.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No phone numbers configured
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPhoneNumbers;