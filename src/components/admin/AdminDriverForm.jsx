import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PhotoUpload from '@/components/driver/PhotoUpload';
import { Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const AdminDriverForm = ({ driverId, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    bio: '',
    languages_spoken: [],
    avatar_url: '',
    verification_status: 'pending',
    verification_rejection_reason: '',
    rating: 5.0,
    total_earnings: 0
  });

  useEffect(() => {
    const fetchDriver = async () => {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', driverId)
            .single();
        
        if (data) {
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.phone || '',
                email: data.email || '',
                bio: data.bio || '',
                languages_spoken: data.languages_spoken || [],
                avatar_url: data.avatar_url || '',
                verification_status: data.verification_status || 'pending',
                verification_rejection_reason: data.verification_rejection_reason || '',
                rating: data.rating || 5.0,
                total_earnings: data.total_earnings || 0
            });
        }
        setLoading(false);
    };
    if (driverId) fetchDriver();
  }, [driverId]);

  const handleSave = async (e) => {
      e.preventDefault();
      setSaving(true);
      
      const { error } = await supabase
          .from('drivers')
          .update({
              first_name: formData.first_name,
              last_name: formData.last_name,
              phone: formData.phone,
              email: formData.email,
              bio: formData.bio,
              languages_spoken: formData.languages_spoken,
              avatar_url: formData.avatar_url,
              verification_status: formData.verification_status,
              verification_rejection_reason: formData.verification_rejection_reason,
              rating: parseFloat(formData.rating)
          })
          .eq('id', driverId);

      if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
          toast({ title: 'Success', description: 'Driver updated successfully' });
          onSuccess();
      }
      setSaving(false);
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => {
        const langs = prev.languages_spoken.includes(lang)
            ? prev.languages_spoken.filter(l => l !== lang)
            : [...prev.languages_spoken, lang];
        return { ...prev, languages_spoken: langs };
    });
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
      <form onSubmit={handleSave} className="space-y-6">
          <div className="flex gap-6">
              <div className="w-1/3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Label>Verification Status</Label>
                      <Select 
                          value={formData.verification_status} 
                          onValueChange={v => setFormData({...formData, verification_status: v})}
                      >
                          <SelectTrigger className="bg-white mb-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                      </Select>

                      {formData.verification_status === 'rejected' && (
                          <div className="mt-2">
                              <Label className="text-red-600">Rejection Reason</Label>
                              <Textarea 
                                  value={formData.verification_rejection_reason} 
                                  onChange={e => setFormData({...formData, verification_rejection_reason: e.target.value})} 
                                  placeholder="Why was this driver rejected?"
                                  className="border-red-200"
                              />
                          </div>
                      )}
                  </div>
                  
                  <div className="mt-4">
                      <Label>Avatar</Label>
                      {formData.avatar_url && (
                          <img src={formData.avatar_url} className="w-24 h-24 rounded-full object-cover mb-2 border" />
                      )}
                      <PhotoUpload 
                          bucketName="driver-avatars"
                          pathPrefix={`admin-edit-${driverId}`}
                          compact
                          onUploadComplete={url => setFormData({...formData, avatar_url: url})}
                      />
                  </div>
              </div>

              <div className="w-2/3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div><Label>First Name</Label><Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
                      <div><Label>Last Name</Label><Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                      <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Languages</Label>
                    <div className="flex gap-4">
                        {['EN', 'RU', 'KA'].map(lang => (
                            <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.languages_spoken.includes(lang)} 
                                    onChange={() => toggleLanguage(lang)}
                                    className="rounded border-gray-300"
                                />
                                <span>{lang}</span>
                            </label>
                        ))}
                    </div>
                  </div>

                  <div>
                      <Label>Bio</Label>
                      <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                      <div>
                          <Label>Rating</Label>
                          <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                      </div>
                      <div>
                          <Label>Total Earnings (Read Only)</Label>
                          <Input value={formData.total_earnings} disabled />
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-gray-900 text-white">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
              </Button>
          </div>
      </form>
  );
};

export default AdminDriverForm;