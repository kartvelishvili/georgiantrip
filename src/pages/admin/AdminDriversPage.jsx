
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, MoreVertical, Edit, Trash2, Shield, Map, Ban, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import DriverStatusBadge from '@/components/admin/DriverStatusBadge';
import DriverApprovalModal from '@/components/admin/DriverApprovalModal';
import { useNavigate } from 'react-router-dom';

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching drivers', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      (driver.first_name + ' ' + driver.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter || driver.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleBlockToggle = async (driver) => {
    const newStatus = driver.status === 'blocked' ? 'active' : 'blocked';
    try {
      const { error } = await supabase.from('drivers').update({ status: newStatus }).eq('id', driver.id);
      if (error) throw error;
      
      toast({ title: `Driver ${newStatus === 'blocked' ? 'Blocked' : 'Unblocked'}` });
      fetchDrivers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: 'Driver deleted' });
      fetchDrivers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Drivers Management</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
           <CardTitle className="text-lg font-medium">All Drivers</CardTitle>
           <div className="flex gap-2">
             <div className="relative">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
               <Input 
                  placeholder="Search name or email..." 
                  className="pl-9 w-[250px]" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
             </Select>
           </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Total Earnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading drivers...</TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No drivers found.</TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        {driver.first_name} {driver.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{driver.email}</div>
                        <div className="text-xs text-gray-500">{driver.phone}</div>
                      </TableCell>
                      <TableCell>
                        <DriverStatusBadge status={driver.status} verificationStatus={driver.verification_status} />
                      </TableCell>
                      <TableCell className="capitalize text-sm">{driver.verification_status}</TableCell>
                      <TableCell className="text-right font-medium">
                         ₾{(driver.total_earnings || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {driver.verification_status === 'pending' && (
                              <DropdownMenuItem onClick={() => { setSelectedDriver(driver); setIsApprovalModalOpen(true); }}>
                                <Shield className="mr-2 h-4 w-4" /> Review Application
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate(`/paneli/drivers/${driver.id}/routes`)}>
                              <Map className="mr-2 h-4 w-4" /> View Routes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/paneli/drivers/${driver.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockToggle(driver)}>
                              {driver.status === 'blocked' ? (
                                <><CheckCircle className="mr-2 h-4 w-4" /> Unblock Driver</>
                              ) : (
                                <><Ban className="mr-2 h-4 w-4" /> Block Driver</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(driver.id)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Driver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DriverApprovalModal 
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        driver={selectedDriver}
        onUpdate={fetchDrivers}
      />
    </div>
  );
};

export default AdminDriversPage;
