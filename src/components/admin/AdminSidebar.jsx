
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  DollarSign, 
  Settings, 
  LogOut,
  MapPin,
  Tag,
  MessageSquare,
  Calendar,
  Image,
  Info,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for expanded menu items
  const [expandedMenus, setExpandedMenus] = useState({
    drivers: true,
    bookings: false,
    finances: false,
    tours: false
  });

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin-login');
  };

  const menuItems = [
    { to: '/paneli/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    
    // Drivers Section
    {
      id: 'drivers',
      label: 'Drivers',
      icon: Users,
      submenu: [
        { to: '/paneli/drivers', label: 'All Drivers' },
        // These filters could be implemented as query params or sub-routes later, for now linking to main list
        // which has filters built-in
      ]
    },

    // Bookings Section
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      submenu: [
        { to: '/paneli/bookings', label: 'All Bookings' },
      ]
    },

    // Finances Section
    {
      id: 'finances',
      label: 'Finances',
      icon: DollarSign,
      submenu: [
        { to: '/paneli/earnings', label: 'Driver Earnings' }, // Legacy/Existing
        { to: '/paneli/finances', label: 'Financial Overview' } // New
      ]
    },

    // Tours Section
    {
      id: 'tours',
      label: 'Tours',
      icon: Tag,
      submenu: [
        { to: '/paneli/tours', label: 'All Tours' },
        { to: '/paneli/tour-bookings', label: 'Tour Bookings' },
      ]
    },

    { to: '/paneli/cars', icon: Car, label: 'Cars' },
    { to: '/paneli/transfers', icon: MapPin, label: 'Transfers' },
    { to: '/paneli/locations', icon: MapPin, label: 'Locations' },
    
    // CMS Section
    { type: 'divider', label: 'Content Management' },
          { to: '/paneli/site-content', icon: Globe, label: 'Site Content' },    { to: '/paneli/hero', icon: Image, label: 'Hero Section' },
    { to: '/paneli/about', icon: Info, label: 'About Page' },
    { to: '/paneli/sms', icon: MessageSquare, label: 'SMS Settings' },
    { to: '/paneli/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 z-50 flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/40">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">GeorgianTrip</h2>
            <span className="text-[10px] uppercase tracking-widest text-green-400 font-bold">Admin Panel</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.type === 'divider') {
            return (
              <div key={item.label} className="pt-4 pb-2 px-3">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{item.label}</span>
              </div>
            );
          }

          if (item.submenu) {
            const isActive = location.pathname.startsWith(item.submenu[0].to) || 
                             item.submenu.some(sub => location.pathname === sub.to);
            const isExpanded = expandedMenus[item.id];

            return (
              <div key={item.id} className="mb-0.5">
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive ? 'text-white font-medium bg-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-green-400' : 'text-gray-500'}`} />
                    {item.label}
                  </div>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                
                {isExpanded && (
                  <div className="pl-10 pr-2 py-0.5 space-y-0.5">
                    {item.submenu.map(subItem => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        end
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive
                              ? 'text-green-400 font-medium bg-green-500/10'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                          }`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-green-600 text-white font-medium shadow-md shadow-green-900/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
            >
              <item.icon className={`w-[18px] h-[18px] ${location.pathname === item.to ? 'text-white' : 'text-gray-500'}`} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
