import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import PhotoUpload from '@/components/driver/PhotoUpload';
import { AlertCircle, CheckCircle } from 'lucide-react';

const DriverVerify = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [docs, setDocs] = useState({
      id_url: '',
      license_url: '',
      car_docs_url: ''
  });

  useEffect(() => {
    if (user) loadDriver();
  }, [user]);

  const loadDriver = async () => {
      const { data } = await supabase.from('drivers').select('*').eq('user_id', user.id).single();
      if (data) {
          setDriver(data);
          setDocs({
              id_url: data.id_document_url || '',
              license_url: data.driving_license_url || '',
              car_docs_url: data.car_documents_url || ''
          });
          
          // If already verified, redirect
          if (data.verification_status === 'approved') {
              navigate('/driver/dashboard');
          }
      }
      setLoading(false);
  };

  const handleComplete = async () => {
      if (!docs.id_url || !docs.license_url) {
          toast({ variant: 'destructive', title: 'Missing Documents', description: 'Please upload both ID and License.' });
          return;
      }

      const { error } = await supabase.from('drivers').update({
          id_document_url: docs.id_url,
          driving_license_url: docs.license_url,
          car_documents_url: docs.car_docs_url,
          verification_status: 'pending' // ensure it's pending review
      }).eq('user_id', user.id);

      if (!error) {
          toast({ title: 'Documents Uploaded', description: 'Your profile is under review.' });
          navigate('/driver/dashboard');
      } else {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Verify Your Identity</h1>
                <p className="text-gray-500 mt-2">Upload your documents to start accepting bookings.</p>
                
                {driver?.verification_status === 'rejected' && (
                    <div className="mt-4 bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <div className="text-left text-sm">
                            <p className="font-bold">Verification Rejected</p>
                            <p>{driver.rejection_reason || 'Please re-upload clear copies of your documents.'}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>ID Card / Passport (Front) *</Label>
                        <PhotoUpload 
                            bucketName="driver-documents" 
                            pathPrefix={`${user.id}/id`}
                            onUploadComplete={url => setDocs({...docs, id_url: url})}
                        />
                        {docs.id_url && <p className="text-xs text-green-600 mt-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Uploaded</p>}
                    </div>

                    <div>
                        <Label>Driving License (Front) *</Label>
                        <PhotoUpload 
                            bucketName="driver-documents" 
                            pathPrefix={`${user.id}/license`}
                            onUploadComplete={url => setDocs({...docs, license_url: url})}
                        />
                        {docs.license_url && <p className="text-xs text-green-600 mt-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Uploaded</p>}
                    </div>
                </div>

                <div>
                    <Label>Car Tech Passport (Optional)</Label>
                    <p className="text-xs text-gray-500 mb-2">You can add this later when adding a car.</p>
                    <PhotoUpload 
                        bucketName="driver-documents" 
                        pathPrefix={`${user.id}/car`}
                        onUploadComplete={url => setDocs({...docs, car_docs_url: url})}
                        className="h-24"
                    />
                </div>

                <div className="pt-4 border-t">
                    <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                        Submit for Verification
                    </Button>
                </div>
            </div>
        </Card>
    </div>
  );
};

export default DriverVerify;