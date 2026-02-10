
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Eye, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TourForm from '@/components/admin/TourForm';

const ToursManagementPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete tour "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('tours').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Tour Deleted' });
      fetchTours();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleAddNew = () => {
    setEditingTour(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldRefresh) => {
    setIsFormOpen(false);
    setEditingTour(null);
    if (shouldRefresh) fetchTours();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Tours Management</h1>
          <p className="text-sm text-gray-500 mt-1">{tours.length} total tours</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" /> Add New Tour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price (Per Person)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Loading tours...</TableCell>
                  </TableRow>
                ) : tours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No tours found. Click "Add New Tour" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  tours.map((tour) => (
                    <TableRow key={tour.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {(tour.image_url || tour.main_image) && (
                            <img
                              src={tour.image_url || tour.main_image}
                              alt={tour.name_en || tour.title_en}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <div className="font-semibold">{tour.name_en || tour.title_en || 'Untitled'}</div>
                            {tour.name_ka && (
                              <div className="text-xs text-gray-400 truncate max-w-[200px]">{tour.name_ka}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-3 h-3 mr-1" /> {tour.duration_days} Day{tour.duration_days > 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-green-700">
                        ₾{tour.price_per_person || tour.price || 0}
                      </TableCell>
                      <TableCell>
                        {(tour.is_active ?? tour.active) ? (
                          <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {tour.is_featured && (
                          <Badge className="ml-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">Featured</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            title="View on site"
                            onClick={() => window.open(`/tours/${tour.id}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            title="Full edit (gallery, pricing, itinerary)"
                            onClick={() => navigate(`/paneli/tours/${tour.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            title="Quick edit"
                            onClick={() => handleEdit(tour)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete tour"
                            onClick={() => handleDelete(tour.id, tour.name_en || tour.title_en)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Tour Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleFormClose(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TourForm tour={editingTour} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToursManagementPage;
