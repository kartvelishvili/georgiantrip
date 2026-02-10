
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Case 1: Not logged in at all
  if (!user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Case 2: Logged in, but NOT an admin
  if (!isAdmin) {
    // We redirect to admin login, where the logic will handle showing "Unauthorized" or signing out.
    // We can also pass a state to indicate why they were redirected.
    return <Navigate to="/admin-login" state={{ from: location, error: "unauthorized" }} replace />;
  }

  // Case 3: Logged in and IS admin
  return children;
};

export default ProtectedAdminRoute;
