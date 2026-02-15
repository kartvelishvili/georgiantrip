
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = ({ onNavigate }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  
  const headerBgClass = isHomePage && !scrolled 
    ? "bg-[#064E3B]/80 backdrop-blur-md border-b border-white/10" 
    : "bg-[#064E3B] shadow-lg border-b border-green-800/30";

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: 'Transfers', path: '/transfers' },
    { name: t('tours'), path: '/tours' },
    { name: 'About', path: '/about' },
    { name: t('contact'), path: '/contact' },
  ];

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3", headerBgClass)}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative z-50">
            <img 
              src="https://i.postimg.cc/mgptfmRm/1-edited-1-1-qy5zwzzwpu0j6dxk2m4luqhe8smsejxkfebuablb4a.png" 
              alt="GeorgianTrip Logo" 
              className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-4 py-2 text-sm font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 hover:text-white border border-white/20 rounded-full px-3 h-9"
                >
                  <span className="uppercase flex items-center gap-2 font-medium">
                      {currentLanguage === 'ka' && '🇬🇪'}
                      {currentLanguage === 'en' && '🇬🇧'}
                      {currentLanguage === 'ru' && '🇷🇺'}
                      <span className="text-xs">{currentLanguage.toUpperCase()}</span>
                      <ChevronDown className="w-3 h-3 opacity-70" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white rounded-xl shadow-xl p-1 border-gray-100 mt-2">
                <DropdownMenuItem onClick={() => changeLanguage('ka')} className="cursor-pointer rounded-lg font-medium">
                  🇬🇪 ქართული
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer rounded-lg font-medium">
                  🇬🇧 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ru')} className="cursor-pointer rounded-lg font-medium">
                  🇷🇺 Русский
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-400 text-white rounded-full px-5 shadow-lg shadow-green-900/40 border border-green-400/50 font-bold transition-all transform hover:scale-105">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-xl rounded-xl p-2 mt-2">
                  <DropdownMenuItem asChild>
                    <Link to="/driver" className="rounded-lg cursor-pointer py-2.5 w-full flex items-center font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2 text-green-600" />
                      {t('driverPanel')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 rounded-lg cursor-pointer py-2.5 flex items-center font-medium">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white font-medium">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link to="/driver/login">
                  <Button className="rounded-full px-6 font-bold shadow-lg shadow-black/20 bg-white text-green-800 hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 border border-transparent">
                    Become a Driver
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-0 bg-[#064E3B] z-40 lg:hidden flex flex-col animate-in slide-in-from-right-10 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
              <img 
                 src="https://i.postimg.cc/mgptfmRm/1-edited-1-1-qy5zwzzwpu0j6dxk2m4luqhe8smsejxkfebuablb4a.png" 
                 alt="GeorgianTrip Logo" 
                 className="h-10 w-auto"
              />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20">
                  <X className="w-6 h-6" />
              </button>
          </div>
          <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-bold text-white text-left py-4 border-b border-white/10 flex justify-between items-center hover:text-green-300 transition-colors"
                >
                  {link.name}
                  <ChevronDown className="w-5 h-5 -rotate-90 text-white/50" />
                </Link>
              ))}
            </nav>
            
            <div className="flex flex-col gap-4 mt-auto pb-8">
              {user ? (
                 <Link to="/driver" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-500 hover:bg-green-400 py-6 rounded-xl text-lg shadow-lg font-bold border border-green-400/50">
                      {t('driverPanel')}
                    </Button>
                 </Link>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <Link to="/driver/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-white text-green-800 hover:bg-gray-100 py-6 rounded-xl text-lg font-bold shadow-lg">
                      Join as Driver
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white py-6 rounded-xl text-lg font-medium">
                      {t('signIn')}
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3 mt-4">
                <button onClick={() => changeLanguage('ka')} className={`py-3 rounded-xl border font-bold ${currentLanguage === 'ka' ? 'border-green-400 bg-green-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}>KA</button>
                <button onClick={() => changeLanguage('en')} className={`py-3 rounded-xl border font-bold ${currentLanguage === 'en' ? 'border-green-400 bg-green-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}>EN</button>
                <button onClick={() => changeLanguage('ru')} className={`py-3 rounded-xl border font-bold ${currentLanguage === 'ru' ? 'border-green-400 bg-green-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-300'}`}>RU</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
