
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  ChevronRight,
  X
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onClose?.();
  };

  const menuItems = [
    { to: '/paneli/dashboard', icon: LayoutDashboard, label: t('admin_dashboard') },
    
    {
      id: 'drivers',
      label: t('admin_drivers'),
      icon: Users,
      submenu: [
        { to: '/paneli/drivers', label: t('admin_allDrivers') },
      ]
    },

    {
      id: 'bookings',
      label: t('admin_bookings'),
      icon: Calendar,
      submenu: [
        { to: '/paneli/bookings', label: t('admin_allBookings') },
      ]
    },

    {
      id: 'finances',
      label: t('admin_finances'),
      icon: DollarSign,
      submenu: [
        { to: '/paneli/earnings', label: t('admin_driverEarnings') },
        { to: '/paneli/finances', label: t('admin_financialOverview') }
      ]
    },

    {
      id: 'tours',
      label: t('admin_tours'),
      icon: Tag,
      submenu: [
        { to: '/paneli/tours', label: t('admin_allTours') },
        { to: '/paneli/tour-bookings', label: t('admin_tourBookingsMenu') },
      ]
    },

    { to: '/paneli/cars', icon: Car, label: t('admin_cars') },
    { to: '/paneli/transfers', icon: MapPin, label: t('admin_transfers') },
    { to: '/paneli/locations', icon: MapPin, label: t('admin_locations') },
    
    { type: 'divider', label: t('admin_contentManagement') },
    { to: '/paneli/site-content', icon: Globe, label: t('admin_siteContent') },
    { to: '/paneli/hero', icon: Image, label: t('admin_heroSection') },
    { to: '/paneli/about', icon: Info, label: t('admin_aboutPage') },
    { to: '/paneli/sms', icon: MessageSquare, label: t('admin_smsSettings') },
    { to: '/paneli/settings', icon: Settings, label: t('admin_settings') },
  ];

  const languageOptions = [
    { code: 'ka', label: '🇬🇪 ქართული' },
    { code: 'en', label: '🇬🇧 English' },
    { code: 'ru', label: '🇷🇺 Русский' },
  ];

  return (
    <div className={`fixed left-0 top-0 w-64 h-full bg-gray-900 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/40">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">GeorgianTrip</h2>
            <span className="text-[10px] uppercase tracking-widest text-green-400 font-bold">{t('adminPanel')}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Language Switcher */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {languageOptions.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                currentLanguage === lang.code 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang.code.toUpperCase()}
            </button>
          ))}
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
                        onClick={handleNavClick}
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
              onClick={handleNavClick}
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
          {t('admin_logout')}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
