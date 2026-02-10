
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Car, DollarSign, TrendingUp, Calendar, ArrowRight, Activity, Map } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AdminPanelDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentDrivers, setRecentDrivers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Counts
        const { count: driverCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
        const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        
        // Fetch Revenue (Mock calculation for example)
        // Ideally this comes from a dedicated table or complex query
        const { data: bookingData } = await supabase.from('bookings').select('total_price').eq('status', 'completed');
        const totalRevenue = bookingData?.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) || 0;

        setStats({
          totalDrivers: driverCount || 0,
          totalBookings: bookingCount || 0,
          totalRevenue: totalRevenue,
        });

        // Fetch Recent Drivers
        const { data: drivers } = await supabase
          .from('drivers')
          .select('id, first_name, last_name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentDrivers(drivers || []);

        // Fetch Recent Bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, customer_first_name, status, total_price, date')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentBookings(bookings || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const QuickStatCard = ({ icon: Icon, label, value, colorClass, bgClass }) => (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your platform's performance</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/paneli/bookings')}>View Bookings</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/paneli/drivers')}>Manage Drivers</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatCard 
          icon={Users} 
          label="Total Drivers" 
          value={stats.totalDrivers} 
          bgClass="bg-blue-50" 
          colorClass="text-blue-600" 
        />
        <QuickStatCard 
          icon={Calendar} 
          label="Total Bookings" 
          value={stats.totalBookings} 
          bgClass="bg-purple-50" 
          colorClass="text-purple-600" 
        />
        <QuickStatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`₾${stats.totalRevenue.toLocaleString()}`} 
          bgClass="bg-green-50" 
          colorClass="text-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Drivers</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/paneli/drivers')}>
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                 <p className="text-sm text-gray-500">Loading...</p>
              ) : recentDrivers.length === 0 ? (
                 <p className="text-sm text-gray-500">No recent drivers.</p>
              ) : (
                recentDrivers.map(driver => (
                  <div key={driver.id} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {driver.first_name?.[0]}{driver.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{driver.first_name} {driver.last_name}</p>
                        <p className="text-xs text-gray-400">Joined {format(new Date(driver.created_at), 'MMM dd')}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {driver.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/paneli/bookings')}>
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {loading ? (
                 <p className="text-sm text-gray-500">Loading...</p>
              ) : recentBookings.length === 0 ? (
                 <p className="text-sm text-gray-500">No recent bookings.</p>
              ) : (
                recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Map className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{booking.customer_first_name}</p>
                        <p className="text-xs text-gray-400">{format(new Date(booking.date), 'MMM dd')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold">₾{booking.total_price}</p>
                       <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                         booking.status === 'completed' ? 'text-green-600 bg-green-50' : 
                         booking.status === 'cancelled' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                       }`}>
                         {booking.status}
                       </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanelDashboard;
