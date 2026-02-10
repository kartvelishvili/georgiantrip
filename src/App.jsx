
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/SupabaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import ErrorBoundary from '@/components/ErrorBoundary';
import ScrollToTop from '@/components/ScrollToTop';

// Layouts
import PublicLayout from '@/components/layouts/PublicLayout';
import AdminPanelLayout from '@/components/layouts/AdminPanelLayout';
import DriverLayout from '@/components/driver/DriverLayout';

// Public Pages
import HomePage from '@/pages/HomePage';
import SearchResults from '@/pages/SearchResults';
import TransferSearchPage from '@/pages/TransferSearchPage';
import TransferDetailPage from '@/pages/TransferDetailPage';
import TransfersPage from '@/pages/TransfersPage'; 
import BookingStatusPage from '@/pages/BookingStatusPage';
import BookingCreationPage from '@/pages/BookingCreationPage';
import ToursPage from '@/pages/ToursPage';
import TourDetailPage from '@/pages/TourDetailPage';
import CarDetailPage from '@/pages/CarDetailPage'; 
import BookingConfirmationPage from '@/pages/BookingConfirmationPage'; 
import Login from '@/components/auth/Login';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';

// Driver Pages
import DriverLogin from '@/pages/driver/DriverLogin';
import DriverVerify from '@/pages/driver/DriverVerify';
import DriverDashboard from '@/pages/driver/DriverDashboard';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverCars from '@/pages/driver/DriverCars';
import DriverCarDetails from '@/pages/driver/DriverCarDetails';
import DriverCarFormPage from '@/pages/driver/DriverCarForm';
import DriverPricing from '@/pages/driver/DriverPricing';
import DriverBookings from '@/pages/driver/DriverBookings';
import DriverMessages from '@/pages/driver/DriverMessages';
import DriverSettings from '@/pages/driver/DriverSettings';
import DriverEarnings from '@/pages/driver/DriverEarnings';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminPanelOverview from '@/pages/admin/AdminPanelOverview';
import AdminPanelDashboard from '@/pages/admin/AdminPanelDashboard';
import AdminDriversPage from '@/pages/admin/AdminDriversPage';
import AdminCarsPage from '@/pages/admin/AdminCarsPage'; 
import BookingsManagementPage from '@/pages/admin/BookingsManagementPage';
import AdminCarEdit from '@/pages/admin/AdminCarEdit';
import AdminDriverEdit from '@/pages/admin/AdminDriverEdit';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminEarnings from '@/pages/admin/AdminEarnings';
import ToursManagementPage from '@/pages/admin/ToursManagementPage';
import TourBookingsPage from '@/pages/admin/TourBookingsPage';
import AdminTourDetailPage from '@/pages/admin/AdminTourDetailPage';
import AdminTransfersPage from '@/pages/admin/AdminTransfersPage';
import AdminHeroPage from '@/pages/admin/AdminHeroPage';
import AdminAboutPage from '@/pages/admin/AdminAboutPage';
import AdminSmsPage from '@/pages/admin/AdminSmsPage';
import SiteContentPage from '@/pages/admin/SiteContentPage';
import LocationsManagement from '@/components/admin/LocationsManagement';
import DriverRoutesPage from '@/pages/admin/DriverRoutesPage';
import FinancesPage from '@/pages/admin/FinancesPage';

// Auth Protection Components
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';

const ProtectedDriverRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = React.useState(true);
  const [isDriver, setIsDriver] = React.useState(false);
  
  React.useEffect(() => {
    const checkDriverRole = async () => {
      if (!user) { setChecking(false); return; }
      const { data } = await supabase.from('drivers').select('id').eq('user_id', user.id).maybeSingle();
      setIsDriver(!!data);
      setChecking(false);
    };
    if (!loading) checkDriverRole();
  }, [user, loading]);
  
  if (loading || checking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/driver/login" replace />;
  
  if (!isDriver) return <Navigate to="/" replace />;
  
  return children;
};

function AppRoutes() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        
        {/* Transfer Routes */}
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/transfer/:transferId" element={<TransferDetailPage />} />
        <Route path="/transfer/s/:transferSlug" element={<TransferSearchPage />} />
        <Route path="/transfer/from-:fromSlug/to-:toSlug" element={<SearchResults />} />
        
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:tourId" element={<TourDetailPage />} />
        <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
        
        {/* Car Detail Route */}
        <Route path="/car/:carId" element={<CarDetailPage />} />
        
        {/* Booking Routes */}
        <Route path="/bookings/new" element={<BookingCreationPage />} />
        <Route path="/bookings/:bookingId" element={<BookingStatusPage />} />
        
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Driver Auth */}
      <Route path="/driver/login" element={<DriverLogin />} />

      {/* Admin Auth */}
      <Route path="/admin-login" element={<AdminLoginPage />} />

      {/* Driver Protected Area */}
      <Route path="/driver" element={
          <ProtectedDriverRoute>
             <DriverLayout />
          </ProtectedDriverRoute>
      }>
          <Route path="verify" element={<DriverVerify />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="cars" element={<DriverCars />} />
          <Route path="cars/new" element={<DriverCarFormPage />} />
          <Route path="cars/:carId" element={<DriverCarDetails />} />
          <Route path="cars/:carId/edit" element={<DriverCarFormPage />} />
          <Route path="pricing" element={<DriverPricing />} />
          <Route path="bookings" element={<DriverBookings />} />
          <Route path="messages" element={<DriverMessages />} />
          <Route path="settings" element={<DriverSettings />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/paneli" element={
          <ProtectedAdminRoute>
            <AdminPanelLayout />
          </ProtectedAdminRoute>
      }>
          {/* Default route redirects to dashboard */}
          <Route index element={<AdminPanelOverview />} />
          <Route path="dashboard" element={<AdminPanelDashboard />} />
          
          {/* Driver Management */}
          <Route path="drivers" element={<AdminDriversPage />} />
          <Route path="drivers/:id/routes" element={<DriverRoutesPage />} />
          <Route path="drivers/:driverId/edit" element={<AdminDriverEdit />} />
          
          {/* Business Logic */}
          <Route path="bookings" element={<BookingsManagementPage />} />
          <Route path="finances" element={<FinancesPage />} />
          <Route path="earnings" element={<AdminEarnings />} />
          
          {/* Inventory & Content */}
          <Route path="cars" element={<AdminCarsPage />} /> 
          <Route path="cars/:carId/edit" element={<AdminCarEdit />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="locations" element={<LocationsManagement />} />
          
          <Route path="tours" element={<ToursManagementPage />} />
          <Route path="tours/:tourId" element={<AdminTourDetailPage />} />
          <Route path="tour-bookings" element={<TourBookingsPage />} />
          
          <Route path="transfers" element={<AdminTransfersPage />} />
          <Route path="hero" element={<AdminHeroPage />} />
          <Route path="about" element={<AdminAboutPage />} />
          <Route path="sms" element={<AdminSmsPage />} />
          <Route path="site-content" element={<SiteContentPage />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Helmet>
            <title>GeorgianTrip - Reliable Transfers & Tours</title>
          </Helmet>
          <AppRoutes />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
