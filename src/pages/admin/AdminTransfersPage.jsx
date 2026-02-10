import React from 'react';
import TransfersTable from '@/components/admin/TransfersTable';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminTransfersPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container-custom py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Transfers Management</h1>
      </div>
      <TransfersTable />
    </div>
  );
};

export default AdminTransfersPage;