
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminPanelLayout = () => {
  const { user, loading, isAdmin } = useAuth();

  // Double check auth state here, though ProtectedAdminRoute should handle it.
  // This acts as a layout wrapper that provides the sidebar.
  
  if (loading) return null; // Or a spinner, but route wrapper handles it usually

  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Header Area */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-heading font-semibold text-gray-800">
            Welcome back, {user.user_metadata?.first_name || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
               {user.email}
               {user.user_metadata?.role === 'super_admin' && (
                 <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">Super Admin</span>
               )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title="საიტზე გადასვლა"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
               {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanelLayout;
