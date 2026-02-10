import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Car, User, Home, TrendingUp, Star, MessageSquare } from 'lucide-react';
import MyCars from './MyCars';
import MyProfile from './MyProfile';
import MyPricing from './MyPricing';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    let { data } = await supabase.from('drivers').select('*').eq('user_id', user.id).maybeSingle();
    setDriver(data);
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading your dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
             <h1 className="text-3xl font-heading font-bold text-gray-900 mb-1">Welcome back, {driver?.first_name || 'Driver'}!</h1>
             <p className="text-gray-500">Here's what's happening with your business today.</p>
          </div>
          {driver && (
              <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                      <p className="font-bold text-sm text-gray-900">{driver.first_name} {driver.last_name}</p>
                      <div className="flex items-center justify-end gap-1">
                          <span className={`w-2 h-2 rounded-full ${driver.verification_status === 'verified' || driver.verification_status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          <p className="text-xs text-gray-500 capitalize">{driver.verification_status}</p>
                      </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-md">
                      {driver.avatar_url ? (
                          <img src={driver.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 font-bold text-lg">{driver.first_name?.[0]}</div>
                      )}
                  </div>
              </div>
          )}
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full justify-start bg-white p-2 rounded-xl border border-gray-100 mb-6 shadow-sm overflow-x-auto h-auto gap-2">
          <TabsTrigger value="dashboard" className="px-4 py-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-lg"><Home className="w-4 h-4 mr-2"/>Dashboard</TabsTrigger>
          <TabsTrigger value="cars" className="px-4 py-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-lg"><Car className="w-4 h-4 mr-2"/>My Cars</TabsTrigger>
          <TabsTrigger value="pricing" className="px-4 py-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-lg"><DollarSign className="w-4 h-4 mr-2"/>Pricing</TabsTrigger>
          <TabsTrigger value="profile" className="px-4 py-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-lg"><User className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
             {/* Stats Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-green-50 to-white">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600"><TrendingUp className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                     </div>
                     <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
                     <h3 className="text-3xl font-bold text-gray-900 mt-1">{driver?.total_earnings || 0} ₾</h3>
                 </Card>
                 
                 <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-yellow-50 to-white">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600"><Star className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">4.9 Avg</span>
                     </div>
                     <p className="text-gray-500 text-sm font-medium">Driver Rating</p>
                     <h3 className="text-3xl font-bold text-gray-900 mt-1">{driver?.rating || 'N/A'}</h3>
                 </Card>

                 <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-blue-50 to-white">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><MessageSquare className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">New</span>
                     </div>
                     <p className="text-gray-500 text-sm font-medium">Total Reviews</p>
                     <h3 className="text-3xl font-bold text-gray-900 mt-1">{driver?.reviews_count || 0}</h3>
                 </Card>
             </div>

             {/* Recent Activity Mockup */}
             <Card className="p-6 border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Recent Bookings</h3>
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No recent bookings found.</p>
                </div>
             </Card>
        </TabsContent>

        <TabsContent value="cars"><MyCars /></TabsContent>
        <TabsContent value="pricing"><MyPricing /></TabsContent>
        <TabsContent value="profile"><MyProfile /></TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverDashboard;