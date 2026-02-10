import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Car, Users, Calendar, MapPin, Tag, AlertCircle, Compass, DollarSign } from 'lucide-react';
import BookingsManagement from './BookingsManagement';
import DriversManagement from './DriversManagement';
import LocationsManagement from './LocationsManagement';
import PricingManagement from './PricingManagement';
import ToursManagement from './ToursManagement';
import CarsManagement from './CarsManagement';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, valueColor = 'text-gray-900', trend }) => (
  <Card className="p-5 border-none shadow-sm bg-white rounded-xl hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <h3 className={`text-3xl font-bold ${valueColor}`}>{value}</h3>
        {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
      </div>
      <div className={`p-2.5 ${iconBg} rounded-xl`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeCars: 0,
    pendingCars: 0,
    totalDrivers: 0,
    totalBookings: 0,
    totalTourBookings: 0,
    pendingDrivers: 0,
    totalTours: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: total },
        { count: active },
        { count: pending },
        { count: drivers },
        { count: bookings },
        { count: tourBookings },
        { count: pendingDrivers },
        { count: tours }
      ] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact', head: true }),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('drivers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('tour_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('tours').select('*', { count: 'exact', head: true }),
      ]);
      
      setStats({
        totalCars: total || 0,
        activeCars: active || 0,
        pendingCars: pending || 0,
        totalDrivers: drivers || 0,
        totalBookings: bookings || 0,
        totalTourBookings: tourBookings || 0,
        pendingDrivers: pendingDrivers || 0,
        totalTours: tours || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Transfer Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          valueColor="text-emerald-700"
        />
        <StatCard
          label="Tour Bookings"
          value={stats.totalTourBookings}
          icon={Compass}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          valueColor="text-blue-700"
        />
        <StatCard
          label="Active Vehicles"
          value={stats.activeCars}
          icon={Car}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          valueColor="text-green-600"
          trend={`${stats.totalCars} total fleet`}
        />
        <StatCard
          label="Registered Drivers"
          value={stats.totalDrivers}
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Alert Cards */}
      {(stats.pendingCars > 0 || stats.pendingDrivers > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.pendingCars > 0 && (
            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">{stats.pendingCars} vehicles pending review</p>
                <p className="text-xs text-amber-600">Go to Cars to approve or reject</p>
              </div>
            </div>
          )}
          {stats.pendingDrivers > 0 && (
            <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-800">{stats.pendingDrivers} drivers awaiting approval</p>
                <p className="text-xs text-orange-600">Go to Drivers to review applications</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="w-full justify-start bg-gray-100/80 p-1 rounded-xl mb-6 overflow-x-auto h-auto gap-1">
          <TabsTrigger value="bookings" className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg"><Calendar className="w-4 h-4 mr-2"/>Bookings</TabsTrigger>
          <TabsTrigger value="cars" className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg"><Car className="w-4 h-4 mr-2"/>Cars</TabsTrigger>
          <TabsTrigger value="drivers" className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg"><Users className="w-4 h-4 mr-2"/>Drivers</TabsTrigger>
          <TabsTrigger value="tours" className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg"><Tag className="w-4 h-4 mr-2"/>Tours</TabsTrigger>
          <TabsTrigger value="locations" className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg"><MapPin className="w-4 h-4 mr-2"/>Locations</TabsTrigger>
          <TabsTrigger value="pricing" className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg"><DollarSign className="w-4 h-4 mr-2"/>Pricing</TabsTrigger>
        </TabsList>
        
        <div className="bg-transparent mt-4">
            <TabsContent value="bookings"><BookingsManagement /></TabsContent>
            <TabsContent value="cars"><CarsManagement /></TabsContent>
            <TabsContent value="drivers"><DriversManagement /></TabsContent>
            <TabsContent value="tours"><ToursManagement /></TabsContent>
            <TabsContent value="locations"><LocationsManagement /></TabsContent>
            <TabsContent value="pricing"><PricingManagement /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;