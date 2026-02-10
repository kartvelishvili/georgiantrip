import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Upload, Search, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { importLocationsFromCSV, fullLocationList } from '@/lib/locationSeeder';

const LocationsManagement = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvText, setCsvText] = useState(fullLocationList);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    name_en: '',
    name_ka: '',
    name_ru: '',
    lat: '',
    lng: '',
    priority: 0,
    is_active: true,
  });
  
  useEffect(() => {
    fetchLocations();
  }, []);
  
  const fetchLocations = async () => {
    setLoading(true);
    let query = supabase
      .from('locations')
      .select('*')
      .order('priority', { ascending: false })
      .order('name_en', { ascending: true });

    if (searchTerm) {
        query = query.ilike('name_en', `%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      // Debounce could be added here
  };

  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          fetchLocations();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
    };

    if (editingLocation) {
      const { error } = await supabase
        .from('locations')
        .update(payload)
        .eq('id', editingLocation.id);
      
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
        return;
      }
      toast({ title: 'Success', description: 'Location updated' });
    } else {
      const { error } = await supabase
        .from('locations')
        .insert(payload);
      
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
        return;
      }
      toast({ title: 'Success', description: 'Location created' });
    }
    
    resetForm();
    setDialogOpen(false);
    fetchLocations();
  };
  
  const resetForm = () => {
      setEditingLocation(null);
      setFormData({
        name_en: '',
        name_ka: '',
        name_ru: '',
        lat: '',
        lng: '',
        priority: 0,
        is_active: true,
      });
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name_en: location.name_en,
      name_ka: location.name_ka || '',
      name_ru: location.name_ru || '',
      lat: location.lat,
      lng: location.lng,
      priority: location.priority,
      is_active: location.is_active,
    });
    setDialogOpen(true);
  };
  
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This might break existing bookings.")) return;

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }
    toast({ title: 'Success', description: 'Location deleted' });
    fetchLocations();
  };

  const handleBulkImport = async () => {
      setImporting(true);
      const result = await importLocationsFromCSV(csvText);
      setImporting(false);
      
      if (result.errors.length > 0) {
          toast({ 
              variant: 'destructive', 
              title: `Imported ${result.success} with ${result.errors.length} errors`, 
              description: "Check console for details." 
          });
          console.error(result.errors);
      } else {
          toast({ 
              title: 'Import Successful', 
              description: `Imported ${result.success} locations.` 
          });
          setImportDialogOpen(false);
          fetchLocations();
      }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
        <div className="flex gap-2">
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" /> Bulk Import
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Import Locations</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Paste CSV data below. Format: Name | Lat | Lng (or comma separated)
                        </p>
                        <textarea 
                            className="w-full h-64 p-2 border rounded-md font-mono text-xs"
                            value={csvText}
                            onChange={(e) => setCsvText(e.target.value)}
                        />
                        <Button onClick={handleBulkImport} disabled={importing} className="w-full">
                            {importing ? "Importing..." : "Run Import"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>
                    {editingLocation ? 'Edit Location' : 'Add New Location'}
                </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Name (English)</Label>
                    <Input required value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Latitude</Label>
                        <Input required type="number" step="any" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} />
                    </div>
                    <div>
                        <Label>Longitude</Label>
                        <Input required type="number" step="any" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Priority</Label>
                        <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} />
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                        <input type="checkbox" id="active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                        <Label htmlFor="active" className="mb-0">Active</Label>
                    </div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    {editingLocation ? 'Update' : 'Create'}
                </Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input 
                placeholder="Search locations..." 
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
            />
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
            <TableHeader className="bg-gray-50">
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : locations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No locations found</TableCell></TableRow>
                ) : (
                    locations.map((loc) => (
                        <TableRow key={loc.id}>
                            <TableCell className="font-medium">{loc.name_en}</TableCell>
                            <TableCell className="text-xs text-gray-500 font-mono">{loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</TableCell>
                            <TableCell>{loc.priority}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${loc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {loc.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(loc)}><Edit2 className="w-4 h-4 text-blue-600"/></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(loc.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LocationsManagement;