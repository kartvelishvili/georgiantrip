
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, Car, Calendar, Map, DollarSign, Settings, Shield } from 'lucide-react';

const InternalLayout = ({ role }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const driverLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/driver' },
    { icon: Calendar, label: 'Bookings', path: '/driver' },
    { icon: Car, label: 'My Cars', path: '/driver' },
    { icon: DollarSign, label: 'Earnings', path: '/driver' },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Overview', path: '/paneli' },
    { icon: Calendar, label: 'Bookings', path: '/paneli' },
    { icon: User, label: 'Drivers', path: '/paneli' },
    { icon: Map, label: 'Tours', path: '/paneli' },
    { icon: Settings, label: 'Settings', path: '/paneli' },
  ];

  const links = role === 'admin' ? adminLinks : driverLinks;
  const bgColor = role === 'admin' ? 'bg-gray-900' : 'bg-green-900';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Internal Navbar */}
      <nav className={`${bgColor} text-white shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="font-heading font-bold">GT</span>
              </div>
              <span className="font-heading font-bold text-lg hidden md:block">
                {role === 'admin' ? 'Admin Portal' : 'Driver Partner'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-sm hidden md:block">
                  <p className="font-medium leading-none">{user?.email}</p>
                  <p className="text-xs text-white/60 capitalize">{role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-3 no-scrollbar">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${
                   location.pathname === link.path 
                   ? 'bg-gray-100 text-gray-900' 
                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default InternalLayout;
