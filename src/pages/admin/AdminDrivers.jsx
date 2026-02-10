import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, MoreHorizontal, Eye, Edit, Ban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const AdminDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setDrivers(data || []);
    setLoading(false);
  };

  const filteredDrivers = drivers.filter(d => 
    d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Drivers Management</h1>
          <Button className="bg-green-600">Export CSV</Button>
       </div>

       <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
             <Input 
                placeholder="Search drivers by name or email..." 
                className="pl-10 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
       </div>

       <Card className="border-none shadow-sm overflow-hidden">
          <Table>
             <TableHeader className="bg-gray-50">
                <TableRow>
                   <TableHead>Driver</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Verification</TableHead>
                   <TableHead>Earnings</TableHead>
                   <TableHead>Rating</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredDrivers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No drivers found</TableCell></TableRow>
                ) : (
                    filteredDrivers.map((driver) => (
                       <TableRow key={driver.id}>
                          <TableCell>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">
                                   {driver.first_name?.[0]}
                                </div>
                                <div>
                                   <div className="font-medium">{driver.first_name} {driver.last_name}</div>
                                   <div className="text-xs text-gray-500">{driver.phone}</div>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant={driver.status === 'active' ? 'default' : 'secondary'} className={driver.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600'}>
                                {driver.status || 'inactive'}
                             </Badge>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className={
                                driver.verification_status === 'approved' ? 'text-green-600 border-green-200' : 
                                driver.verification_status === 'pending' ? 'text-yellow-600 border-yellow-200' : 'text-red-600 border-red-200'
                             }>
                                {driver.verification_status}
                             </Badge>
                          </TableCell>
                          <TableCell>₾{driver.total_earnings || 0}</TableCell>
                          <TableCell>⭐ {driver.rating || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                   <DropdownMenuItem onClick={() => navigate(`/admin/drivers/${driver.id}/edit`)}><Edit className="w-4 h-4 mr-2"/> Edit Details</DropdownMenuItem>
                                   <DropdownMenuItem><Eye className="w-4 h-4 mr-2"/> View Profile</DropdownMenuItem>
                                   <DropdownMenuItem className="text-red-600"><Ban className="w-4 h-4 mr-2"/> Suspend Driver</DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </TableCell>
                       </TableRow>
                    ))
                )}
             </TableBody>
          </Table>
       </Card>
    </div>
  );
};

export default AdminDrivers;