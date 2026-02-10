
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Download, Search, Eye, DollarSign } from 'lucide-react';
import FinancialReportModal from '@/components/admin/FinancialReportModal';

const FinancesPage = () => {
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Get all drivers first
      const { data: drivers, error: driverError } = await supabase.from('drivers').select('*');
      if (driverError) throw driverError;

      // In a real app with massive data, this should be a SQL view or function
      // For now, we fetch and aggregate on client side as requested
      const { data: earnings, error: earningsError } = await supabase.from('driver_earnings').select('*');
      if (earningsError) throw earningsError;

      const aggregated = drivers.map(driver => {
        const driverEarnings = earnings.filter(e => e.driver_id === driver.id);
        const totalEarned = driverEarnings.reduce((sum, item) => sum + (Number(item.gross_amount) || 0), 0);
        const platformCommission = driverEarnings.reduce((sum, item) => sum + (Number(item.platform_commission) || 0), 0);
        
        // Mocking "paid to admin" - usually this would come from a payments table
        // Assuming drivers pay commission manually or it's deducted
        const paidToAdmin = platformCommission * 0.8; // Mock: 80% of commission collected
        
        return {
          ...driver,
          totalEarned,
          paidToAdmin,
          balance: platformCommission - paidToAdmin, // Pending commission to be paid by driver to platform
          history: driverEarnings.map(e => ({
            date: e.created_at,
            amount: e.gross_amount,
            type: 'Trip Earning',
            status: 'completed',
            bookingId: e.booking_id
          }))
        };
      });

      setFinancials(aggregated);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (driver) => {
    setSelectedDriver(driver);
    setReportData({
      totalEarned: driver.totalEarned,
      paidToAdmin: driver.paidToAdmin,
      balance: driver.balance,
      history: driver.history
    });
    setIsReportOpen(true);
  };

  const filteredFinancials = financials.filter(f => 
    (f.first_name + ' ' + f.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Management</h1>
        <Button className="bg-green-600 hover:bg-green-700">
           <Download className="w-4 h-4 mr-2" /> Export All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                     <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Total Platform Revenue</p>
                     <h3 className="text-2xl font-bold">₾{financials.reduce((sum, f) => sum + f.totalEarned, 0).toLocaleString()}</h3>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                     <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Commission Collected</p>
                     <h3 className="text-2xl font-bold">₾{financials.reduce((sum, f) => sum + f.paidToAdmin, 0).toLocaleString()}</h3>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-full text-red-600">
                     <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">Outstanding Balance</p>
                     <h3 className="text-2xl font-bold">₾{financials.reduce((sum, f) => sum + f.balance, 0).toLocaleString()}</h3>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
           <CardTitle>Driver Finances</CardTitle>
           <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                 placeholder="Search driver..." 
                 className="pl-9" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border">
              <Table>
                 <TableHeader>
                    <TableRow>
                       <TableHead>Driver Name</TableHead>
                       <TableHead className="text-right">Total Earned</TableHead>
                       <TableHead className="text-right">Paid to Admin</TableHead>
                       <TableHead className="text-right">Balance Due</TableHead>
                       <TableHead className="text-center">Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {loading ? (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">Loading financial data...</TableCell>
                       </TableRow>
                    ) : filteredFinancials.length === 0 ? (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">No data found.</TableCell>
                       </TableRow>
                    ) : (
                       filteredFinancials.map((item) => (
                          <TableRow key={item.id}>
                             <TableCell className="font-medium">{item.first_name} {item.last_name}</TableCell>
                             <TableCell className="text-right">₾{item.totalEarned.toLocaleString()}</TableCell>
                             <TableCell className="text-right text-blue-600 font-medium">₾{item.paidToAdmin.toLocaleString()}</TableCell>
                             <TableCell className="text-right text-red-600 font-bold">₾{item.balance.toLocaleString()}</TableCell>
                             <TableCell className="text-center">
                                {item.balance > 0 ? (
                                   <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Pending</span>
                                ) : (
                                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Clear</span>
                                )}
                             </TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewReport(item)}>
                                   <Eye className="w-4 h-4 mr-2" /> View Report
                                </Button>
                             </TableCell>
                          </TableRow>
                       ))
                    )}
                 </TableBody>
              </Table>
           </div>
        </CardContent>
      </Card>

      <FinancialReportModal 
         isOpen={isReportOpen}
         onClose={() => setIsReportOpen(false)}
         driver={selectedDriver}
         financialData={reportData}
      />
    </div>
  );
};

export default FinancesPage;
