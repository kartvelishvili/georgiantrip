import React from 'react';
import ToursTable from '@/components/admin/ToursTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminToursPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container-custom py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
      </div>
      <ToursTable />
    </div>
  );
};

export default AdminToursPage;