import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { addTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/aboutService';

const AboutTeamEditor = ({ members = [], onUpdate }) => {
    const { toast } = useToast();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', role: '', bio: '', photo_url: '' });

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', role: '', bio: '', photo_url: '' });
    };

    const handleEdit = (member) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            role: member.role,
            bio: member.bio,
            photo_url: member.photo_url || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this team member?")) return;
        try {
            await deleteTeamMember(id);
            toast({ title: "Deleted", description: "Team member removed." });
            onUpdate();
        } catch(e) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateTeamMember(editingId, formData);
                toast({ title: "Updated", description: "Team member updated." });
            } else {
                await addTeamMember(formData);
                toast({ title: "Added", description: "Team member added." });
            }
            resetForm();
            onUpdate();
        } catch(e) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <Label>Photo URL</Label>
                        <Input value={formData.photo_url} onChange={e => setFormData({...formData, photo_url: e.target.value})} />
                    </div>
                    <div>
                        <Label>Bio</Label>
                        <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} />
                    </div>
                    <div className="flex gap-2">
                         <Button type="submit">{editingId ? 'Update' : 'Add Member'}</Button>
                         {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
                    </div>
                </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map(member => (
                    <Card key={member.id} className="p-4 flex gap-4 items-start">
                        <img src={member.photo_url || 'https://placehold.co/100'} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1">
                            <h4 className="font-bold">{member.name}</h4>
                            <p className="text-sm text-green-600">{member.role}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.bio}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                             <Button size="icon" variant="ghost" onClick={() => handleEdit(member)}><Edit2 className="w-4 h-4 text-blue-500" /></Button>
                             <Button size="icon" variant="ghost" onClick={() => handleDelete(member.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AboutTeamEditor;