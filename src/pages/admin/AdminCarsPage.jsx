import React from 'react';
import CarsManagement from '@/components/admin/CarsManagement';
import { Helmet } from 'react-helmet';

const AdminCarsPage = () => {
  return (
    <>
      <Helmet>
        <title>Admin - Car Management | GeorgianTrip</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Vehicle Management</h1>
            <p className="text-gray-500 hidden md:block">Manage all fleet vehicles, approve listings, and monitor status.</p>
        </div>
        <CarsManagement />
      </div>
    </>
  );
};

export default AdminCarsPage;