import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Car, Calendar, Star, Plus, ArrowRight } from 'lucide-react';
import VerificationBadge from '@/components/driver/VerificationBadge';
import MyCars from '@/components/driver/MyCars';
import MyProfile from '@/components/driver/MyProfile';
import MyPricing from '@/components/driver/MyPricing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState({
      earnings: 0,
      activeCars: 0,
      completedBookings: 0,
      rating: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user]);

  // Separate effect for realtime — only subscribe once we have the driver ID
  useEffect(() => {
    if (!driver?.id) return;
    const subscription = supabase
        .channel('driver_dashboard_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `driver_id=eq.${driver.id}` }, payload => {
            loadData();
        })
        .subscribe();
        
    return () => subscription.unsubscribe();
  }, [driver?.id]);

  const loadData = async () => {
    // 1. Get Driver
    const { data: driverData } = await supabase.from('drivers').select('*').eq('user_id', user.id).maybeSingle();
    if (!driverData) { setLoading(false); return; }
    setDriver(driverData);

    // 2. Get Cars Stats
    const { count: carsCount } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('driver_id', driverData.id).eq('active', true);
    
    // 3. Get Bookings Stats & List (join locations for display names)
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          pickup_location:locations!bookings_pickup_location_id_fkey(name_en),
          dropoff_location:locations!bookings_dropoff_location_id_fkey(name_en)
        `)
        .eq('driver_id', driverData.id)
        .order('created_at', { ascending: false });

    // Calculate Earnings
    const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (Number(b.driver_net) || 0), 0);

    setStats({
        earnings: totalEarnings.toFixed(2),
        activeCars: carsCount || 0,
        completedBookings: completedBookings.length,
        rating: driverData.rating || 0
    });
    setRecentBookings(bookings?.slice(0, 5) || []);
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center"><span className="loading loading-spinner text-green-600"></span> Loading Dashboard...</div>;
  if (!driver) return <div className="p-8 text-center">Driver profile not found. Please contact support.</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {driver.first_name}!</h1>
                <div className="flex items-center gap-3 mt-2">
                    <VerificationBadge status={driver.verification_status} />
                    {driver.verification_status === 'rejected' && (
                        <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                            Reason: {driver.verification_rejection_reason || driver.rejection_reason}
                        </span>
                    )}
                </div>
            </div>
            <div className="text-right hidden md:block">
                 <p className="text-sm text-gray-500">Member since {new Date(driver.created_at).getFullYear()}</p>
                 <Link to="/driver/profile" className="text-green-600 text-sm font-medium hover:underline">Manage Profile</Link>
            </div>
        </div>

        {driver.verification_status !== 'approved' && driver.verification_status !== 'verified' && (
             <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex justify-between items-center">
                 <p className="text-sm font-medium">Your account is pending verification. You cannot accept bookings yet.</p>
                 <Button variant="outline" size="sm" className="bg-white hover:bg-yellow-100 text-yellow-800 border-yellow-300" asChild>
                     <Link to="/driver/verify">View Documents</Link>
                 </Button>
             </div>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="bg-white border border-gray-100 p-1 rounded-xl mb-6 shadow-sm overflow-x-auto justify-start w-full md:w-auto h-auto">
                <TabsTrigger value="dashboard" className="px-6 py-2">Dashboard</TabsTrigger>
                <TabsTrigger value="bookings" className="px-6 py-2">Bookings</TabsTrigger>
                <TabsTrigger value="cars" className="px-6 py-2">My Cars</TabsTrigger>
                <TabsTrigger value="profile" className="px-6 py-2">Profile</TabsTrigger>
                <TabsTrigger value="pricing" className="px-6 py-2">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">₾{stats.earnings}</h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl text-green-600"><TrendingUp className="w-6 h-6"/></div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                            Net Income (70%)
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Cars</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeCars}</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Car className="w-6 h-6"/></div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Trips</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.completedBookings}</h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600"><Calendar className="w-6 h-6"/></div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Rating</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.rating} ⭐</h3>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600"><Star className="w-6 h-6"/></div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Bookings */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <Link to="/driver/bookings" className="text-sm text-green-600 font-medium hover:underline flex items-center">
                                View All Bookings <ArrowRight className="w-4 h-4 ml-1"/>
                            </Link>
                        </div>

                        <Card className="overflow-hidden border-gray-100 shadow-sm">
                            {recentBookings.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentBookings.map(booking => (
                                        <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                     <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                     }`}>
                                                        {booking.status}
                                                     </span>
                                                     <span className="text-xs text-gray-400">{new Date(booking.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {booking.pickup_location?.name_en || 'Unknown'} → {booking.dropoff_location?.name_en || 'Destination'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">Customer: {booking.customer_first_name}</p>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                                <p className="font-bold text-green-600">₾{booking.driver_net || booking.final_price}</p>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link to="/driver/bookings">Details</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                                        <Calendar className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-900 font-medium">No bookings yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Your recent trips will appear here.</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                         <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                         <Card className="p-5 space-y-3 shadow-sm border-gray-100">
                             <Button asChild className="w-full justify-start bg-green-600 hover:bg-green-700 h-12 text-base">
                                 <Link to="/driver/cars/new"><Plus className="w-5 h-5 mr-3"/> Add New Car</Link>
                             </Button>
                             <Button asChild variant="outline" className="w-full justify-start h-12 text-base bg-white hover:bg-gray-50">
                                 <Link to="/driver/profile">Update Profile</Link>
                             </Button>
                             <Button asChild variant="outline" className="w-full justify-start h-12 text-base bg-white hover:bg-gray-50">
                                 <Link to="/driver/pricing">Pricing Settings</Link>
                             </Button>
                             <Button asChild variant="outline" className="w-full justify-start h-12 text-base bg-white hover:bg-gray-50">
                                 <Link to="/driver/settings">Account Security</Link>
                             </Button>
                         </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="bookings"><div className="bg-white rounded-xl border p-1"><Link to="/driver/bookings" className="block p-4 text-center text-green-600 hover:underline">Go to Full Bookings Page</Link></div></TabsContent>
            <TabsContent value="cars"><MyCars /></TabsContent>
            <TabsContent value="pricing"><MyPricing /></TabsContent>
            <TabsContent value="profile"><MyProfile /></TabsContent>
        </Tabs>
    </div>
  );
};

export default DriverDashboard;