import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const DriverApprovalModal = ({ isOpen, onClose, driver, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Reset state when modal opens for a different driver or re-opens
  useEffect(() => {
    if (isOpen) {
      setShowRejectInput(false);
      setRejectReason('');
      setLoading(false);
    }
  }, [isOpen, driver]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          verification_status: 'approved',
          status: 'active',
          verification_rejection_reason: null
        })
        .eq('id', driver.id);

      if (error) throw error;

      toast({ title: 'Driver Approved', className: 'bg-green-600 text-white' });
      onUpdate();
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }

    if (!rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a reason for rejection.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          verification_status: 'rejected',
          status: 'inactive',
          verification_rejection_reason: rejectReason 
        })
        .eq('id', driver.id);

      if (error) throw error;

      toast({ title: 'Driver Rejected', description: 'Notification sent to driver.' });
      onUpdate();
      onClose();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!driver) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Driver Application</DialogTitle>
          <DialogDescription>Review documents and approve or reject {driver.first_name} {driver.last_name}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Full Name</Label>
              <p className="font-medium">{driver.first_name} {driver.last_name}</p>
            </div>
            <div>
              <Label className="text-gray-500">Email</Label>
              <p className="font-medium">{driver.email}</p>
            </div>
            <div>
              <Label className="text-gray-500">Phone</Label>
              <p className="font-medium">{driver.phone}</p>
            </div>
            <div>
               <Label className="text-gray-500">Current Status</Label>
               <p className="font-medium capitalize">{driver.verification_status}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Document Checklist
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm">Driving License</span>
                {driver.driving_license_url ? (
                  <a href={driver.driving_license_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center hover:underline">
                    View Document <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span className="text-red-500 text-sm">Not Uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm">ID Document</span>
                {driver.id_document_url ? (
                  <a href={driver.id_document_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center hover:underline">
                    View Document <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span className="text-red-500 text-sm">Not Uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm">Car Documents</span>
                {driver.car_documents_url ? (
                  <a href={driver.car_documents_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center hover:underline">
                    View Document <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span className="text-red-500 text-sm">Not Uploaded</span>
                )}
              </div>
            </div>
          </div>

          {showRejectInput && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Label>Reason for Rejection</Label>
              <Textarea 
                placeholder="Please explain why the application is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1.5"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <div className="flex gap-2">
            <Button 
              variant={showRejectInput ? "default" : "destructive"}
              onClick={handleReject}
              disabled={loading}
              className={showRejectInput ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {showRejectInput ? 'Confirm Rejection' : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
            {!showRejectInput && (
              <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Driver
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverApprovalModal;
