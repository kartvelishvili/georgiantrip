import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Loader2, Save, X, CheckCircle2 } from 'lucide-react';
import PhotoUpload from './PhotoUpload';

const ProfileEditForm = ({ user, initialData, onCancel, onSuccess }) => {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        phone: initialData?.phone || '',
        bio: initialData?.bio || '',
        languages_spoken: initialData?.languages_spoken || [],
        avatar_url: initialData?.avatar_url || ''
    });

    const toggleLanguage = (lang) => {
        setFormData(prev => {
            const currentLangs = prev.languages_spoken || [];
            const langs = currentLangs.includes(lang)
                ? currentLangs.filter(l => l !== lang)
                : [...currentLangs, lang];
            return { ...prev, languages_spoken: langs };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!formData.first_name?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'First Name is required' });
            return;
        }
        if (!formData.last_name?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Last Name is required' });
            return;
        }
        if (!formData.phone?.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Phone number is required' });
            return;
        }

        setSaving(true);
        try {
            const updates = {
                user_id: user.id,
                ...formData,
                email: user.email,
                updated_at: new Date().toISOString()
            };

            // Upsert requires INSERT permission for new rows, which we added via RLS
            const { error } = await supabase
                .from('drivers')
                .upsert(updates, { onConflict: 'user_id' });

            if (error) throw error;

            toast({ title: 'Success', description: 'Profile updated successfully', className: 'bg-green-50 border-green-200' });
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Error saving profile:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:flex-row gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                    </div>
                    <div className="flex-1">
                        <Label className="mb-2 block">Profile Photo</Label>
                        <PhotoUpload 
                            bucketName="driver-avatars" 
                            pathPrefix={user.id} 
                            compact
                            onUploadComplete={(url) => {
                                setFormData(prev => ({ ...prev, avatar_url: url }));
                                toast({ title: "Avatar uploaded" });
                            }} 
                            className="w-full max-w-[200px]"
                        />
                    </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>First Name <span className="text-red-500">*</span></Label>
                        <Input 
                            value={formData.first_name} 
                            onChange={e => setFormData({...formData, first_name: e.target.value})} 
                            className="mt-1" 
                            placeholder="John"
                        />
                    </div>
                    <div>
                        <Label>Last Name <span className="text-red-500">*</span></Label>
                        <Input 
                            value={formData.last_name} 
                            onChange={e => setFormData({...formData, last_name: e.target.value})} 
                            className="mt-1" 
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div>
                    <Label>Phone Number <span className="text-red-500">*</span></Label>
                    <Input 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="mt-1" 
                        placeholder="+995 555 00 00 00"
                    />
                </div>

                <div>
                    <Label className="mb-3 block">Languages Spoken</Label>
                    <div className="flex flex-wrap gap-4">
                        {['EN', 'RU', 'KA'].map(lang => {
                            const isSelected = (formData.languages_spoken || []).includes(lang);
                            return (
                                <label key={lang} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        onChange={() => toggleLanguage(lang)}
                                        className="hidden"
                                    />
                                    <span className="font-bold text-sm">{lang === 'KA' ? '🇬🇪 Georgian' : lang === 'EN' ? '🇬🇧 English' : '🇷🇺 Russian'}</span>
                                    {isSelected && <CheckCircle2 className="w-3 h-3 ml-1" />}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <Label>Short Bio</Label>
                    <Textarea 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})} 
                        placeholder="Tell customers about your experience..."
                        className="min-h-[120px] mt-1"
                        maxLength={500}
                    />
                    <div className="flex justify-end mt-1">
                        <span className="text-xs text-gray-400">{formData.bio.length}/500</span>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 min-w-[140px]" disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ProfileEditForm;