
import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  LayoutDashboard, 
  User, 
  Car, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Menu, 
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DriverLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
        await signOut();
        navigate('/driver/login');
        toast({ title: 'Logged out successfully' });
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/driver/profile', icon: User },
    { name: 'My Cars', path: '/driver/cars', icon: Car },
    { name: 'My Pricing', path: '/driver/pricing', icon: DollarSign },
    { name: 'My Bookings', path: '/driver/bookings', icon: Calendar },
    { name: 'Messages', path: '/driver/messages', icon: MessageSquare },
    { name: 'Settings', path: '/driver/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">GT</div>
          <span className="font-bold text-base">Driver Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo / Branding */}
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-900/30">GT</div>
              <div>
                <span className="font-bold text-base text-white">GeorgianTrip</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Driver Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-green-600 text-white shadow-md shadow-green-900/30' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info + Logout */}
          <div className="p-3 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{user?.email}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Driver</p>
              </div>
            </div>
            <button 
              className="flex items-center gap-3 px-3 py-2.5 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
              onClick={handleLogout}
            >
              <LogOut className="w-[18px] h-[18px]" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Bar Desktop */}
        <header className="hidden md:flex bg-white h-14 items-center justify-between px-8 border-b border-gray-200">
          <h1 className="font-semibold text-gray-800">
            {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
         
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DriverLayout;