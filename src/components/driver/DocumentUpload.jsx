import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileText, CheckCircle, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const DocumentUpload = ({ 
    title, 
    documentType, // 'id', 'license', 'car'
    currentUrl, 
    uploadedAt, 
    status, // 'pending', 'approved', 'rejected'
    rejectionReason,
    onUploadSuccess,
    isRequired = false
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    
    // Map documentType to database columns
    // Handle special case for car documents (plural in DB schema)
    const dbColumnUrl = documentType === 'car' ? 'car_documents_url' : `${documentType}_document_url`;
    const dbColumnDate = documentType === 'car' ? 'car_documents_uploaded_at' : `${documentType}_document_uploaded_at`;

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File too large",
                description: "Please upload a document smaller than 5MB."
            });
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${documentType}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('driver-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            // Note: driver-documents bucket policies must allow public read for this to work for admin
            // Or use signed URLs. Assuming public here based on previous implementation patterns.
            const { data: { publicUrl } } = supabase.storage
                .from('driver-documents')
                .getPublicUrl(filePath);

            // 3. Update Database
            const updates = {
                [dbColumnUrl]: publicUrl,
                [dbColumnDate]: new Date().toISOString(),
                // If previously rejected, set back to pending on new upload
                verification_status: status === 'rejected' ? 'pending_verification' : undefined
            };

            // Remove undefined keys
            Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

            const { error: dbError } = await supabase
                .from('drivers')
                .update(updates)
                .eq('user_id', user.id);

            if (dbError) throw dbError;

            toast({
                title: "Document Uploaded",
                description: `${title} has been uploaded successfully.`
            });

            if (onUploadSuccess) onUploadSuccess();

        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message || "Could not upload document."
            });
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const getStatusBadge = () => {
        if (!currentUrl) return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Not Uploaded</Badge>;
        if (status === 'approved') return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Verified</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Rejected</Badge>;
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Pending Verification</Badge>;
    };

    return (
        <Card className="p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{title}</h4>
                        {isRequired && <span className="text-red-500 text-xs">*</span>}
                        {getStatusBadge()}
                    </div>
                    
                    {uploadedAt && (
                        <p className="text-xs text-gray-500">
                            Uploaded on {new Date(uploadedAt).toLocaleDateString()}
                        </p>
                    )}

                    {status === 'rejected' && rejectionReason && (
                        <div className="mt-2 bg-red-50 text-red-700 p-2 rounded text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span><span className="font-bold">Rejection Reason:</span> {rejectionReason}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {currentUrl ? (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" asChild size="sm" className="flex-1 sm:flex-none">
                                <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="w-4 h-4 mr-2" /> View
                                </a>
                            </Button>
                            <div className="relative flex-1 sm:flex-none">
                                <input
                                    type="file"
                                    id={`replace-${documentType}`}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                    disabled={uploading}
                                    asChild
                                >
                                    <label htmlFor={`replace-${documentType}`} className="cursor-pointer">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                        Replace
                                    </label>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full sm:w-auto">
                            <input
                                type="file"
                                id={`upload-${documentType}`}
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                                disabled={uploading}
                                asChild
                            >
                                <label htmlFor={`upload-${documentType}`} className="cursor-pointer">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Upload Document
                                </label>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default DocumentUpload;