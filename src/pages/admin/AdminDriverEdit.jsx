import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AdminDriverForm from '@/components/admin/AdminDriverForm';

const AdminDriverEdit = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-6">Edit Driver Profile</h1>
        <Card className="p-6">
            <AdminDriverForm 
                driverId={driverId}
                onSuccess={() => navigate('/admin')}
                onCancel={() => navigate('/admin')}
            />
        </Card>
    </div>
  );
};

export default AdminDriverEdit;