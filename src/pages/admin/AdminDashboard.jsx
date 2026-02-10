import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Users, Car, DollarSign, TrendingUp, UserCheck, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    adminCommission: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data for charts - in real app, fetch from Supabase with group by date
    // Stats would come from counting rows
    const { count: driverCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
    const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    
    // Calculate revenue (mock logic for now as we just added columns)
    const { data: bookings } = await supabase.from('bookings').select('passenger_price, admin_commission').not('passenger_price', 'is', null);
    
    let totalRev = 0;
    let totalComm = 0;
    if(bookings) {
        bookings.forEach(b => {
            totalRev += (b.passenger_price || 0);
            totalComm += (b.admin_commission || 0);
        });
    }

    setStats({
      totalDrivers: driverCount || 0,
      activeDrivers: Math.floor((driverCount || 0) * 0.8), // Mock active %
      totalBookings: bookingCount || 0,
      totalRevenue: totalRev,
      adminCommission: totalComm
    });
  };

  const chartData = [
    { name: 'Mon', bookings: 4, revenue: 240 },
    { name: 'Tue', bookings: 3, revenue: 139 },
    { name: 'Wed', bookings: 2, revenue: 980 },
    { name: 'Thu', bookings: 7, revenue: 390 },
    { name: 'Fri', bookings: 12, revenue: 2480 },
    { name: 'Sat', bookings: 15, revenue: 3490 },
    { name: 'Sun', bookings: 10, revenue: 2100 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-heading font-bold text-gray-900">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm bg-white">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6"/></div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
           </div>
           <p className="text-gray-500 text-sm">Total Drivers</p>
           <h3 className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</h3>
           <p className="text-xs text-gray-400 mt-1">{stats.activeDrivers} active currently</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Car className="w-6 h-6"/></div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
           </div>
           <p className="text-gray-500 text-sm">Total Bookings</p>
           <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
           <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><DollarSign className="w-6 h-6"/></div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+18%</span>
           </div>
           <p className="text-gray-500 text-sm">Total Revenue</p>
           <h3 className="text-2xl font-bold text-gray-900">₾{stats.totalRevenue.toLocaleString()}</h3>
           <p className="text-xs text-gray-400 mt-1">Gross volume</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><TrendingUp className="w-6 h-6"/></div>
           </div>
           <p className="text-gray-500 text-sm">Admin Commission</p>
           <h3 className="text-2xl font-bold text-gray-900">₾{stats.adminCommission.toLocaleString()}</h3>
           <p className="text-xs text-gray-400 mt-1">Net earnings</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">Revenue Trend (Last 7 Days)</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                     <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₾${value}`} />
                     <Tooltip />
                     <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-6">
            <h3 className="font-bold text-lg mb-6">Bookings Overview</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip cursor={{fill: '#F3F4F6'}} />
                     <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;