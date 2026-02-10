import React, { useState, useEffect } from 'react';
import { getAllTransfers, updateTransferOrder } from '@/lib/transferService'; // Updated import
import { supabase } from '@/lib/customSupabaseClient'; // Keep if needed for deletes
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, GripVertical, Loader2 } from 'lucide-react';
import TransferForm from './TransferForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Reorder, useDragControls } from 'framer-motion';

// Drag Handle Component
const DragHandle = ({ controls }) => {
  return (
    <div
      onPointerDown={(e) => controls.start(e)}
      className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded touch-none"
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
    </div>
  );
};

// Draggable Row Component
const DraggableRow = ({ transfer, index, onEdit, onDelete, onDragEnd }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={transfer}
            as="tr"
            id={transfer.id}
            dragListener={false}
            dragControls={controls}
            onDragEnd={onDragEnd}
            className="bg-white border-b hover:bg-gray-50 transition-colors relative"
            style={{ position: 'relative' }} // Fix for some browsers
        >
            <TableCell className="w-[50px]">
                <DragHandle controls={controls} />
            </TableCell>
            <TableCell className="text-center font-mono text-xs text-gray-400 w-[50px]">
                {index + 1}
            </TableCell>
            <TableCell className="font-medium">{transfer.name_en}</TableCell>
            <TableCell>{transfer.from_location?.name_en}</TableCell>
            <TableCell>{transfer.to_location?.name_en}</TableCell>
            <TableCell>{transfer.distance_km} km</TableCell>
            <TableCell>₾{transfer.base_price}</TableCell>
            <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${transfer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {transfer.is_active ? 'Active' : 'Inactive'}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(transfer)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(transfer.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            </TableCell>
        </Reorder.Item>
    );
};

const TransfersTable = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const { toast } = useToast();

  const fetchTransfers = async () => {
    setLoading(true);
    try {
        const data = await getAllTransfers();
        setTransfers(data || []);
    } catch (error) {
        console.error("Failed to fetch transfers", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    const { error } = await supabase.from('transfers').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success', description: 'Transfer deleted' });
      fetchTransfers();
    }
  };

  const handleEdit = (transfer) => {
    setEditingTransfer(transfer);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransfer(null);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldRefresh) => {
    setIsFormOpen(false);
    setEditingTransfer(null);
    if (shouldRefresh) fetchTransfers();
  };

  const handleReorder = async (newOrder) => {
      // Optimistically update UI
      setTransfers(newOrder);
      setIsSavingOrder(true);

      try {
          // Debounce could be added here for very rapid dragging, 
          // but for list reordering, usually wait for drop is fine.
          await updateTransferOrder(newOrder);
          
          toast({
             title: "Order Updated",
             description: "New display order has been saved.",
             duration: 2000, 
          });
      } catch (error) {
          toast({ 
              variant: "destructive", 
              title: "Save Failed", 
              description: "Could not save the new order. Refreshing..." 
          });
          fetchTransfers(); // Revert on error
      } finally {
          setIsSavingOrder(false);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {isSavingOrder && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving order...
                </span>
            )}
        </div>
        <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Add New Transfer
        </Button>
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead>Route (EN)</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          {/* Framer Motion Reorder Group requires 'as="tbody"' if rendering rows directly, 
              but standard HTML table structure is strict. We render Reorder.Group as tbody. */}
          <Reorder.Group 
            as="tbody" 
            axis="y" 
            values={transfers} 
            onReorder={handleReorder}
            className="[&_tr]:border-b"
          >
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">No transfers found.</TableCell>
              </TableRow>
            ) : (
              transfers.map((t, index) => (
                <DraggableRow 
                    key={t.id} 
                    transfer={t} 
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    // onDragEnd logic is handled by parent onReorder mostly, but specific item cleanup can go here
                />
              ))
            )}
          </Reorder.Group>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
           {isFormOpen && (
               <TransferForm transfer={editingTransfer} onClose={handleFormClose} />
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransfersTable;