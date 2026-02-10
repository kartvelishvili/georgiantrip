import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const DriversManagement = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDrivers();
  }, []);
  
  const fetchDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setLoading(false);
      return;
    }
    
    setDrivers(data || []);
    setLoading(false);
  };
  
  const updateDriverStatus = async (driverId, status) => {
    const { error } = await supabase
      .from('drivers')
      .update({ verification_status: status })
      .eq('id', driverId);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      return;
    }
    
    toast({
      title: 'Success',
      description: `Driver ${status}`,
    });
    
    fetchDrivers();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {drivers.map((driver) => (
        <Card key={driver.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {driver.first_name.charAt(0)}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-black">
                  {driver.first_name} {driver.last_name}
                </h3>
                <p className="text-gray-600">{driver.email}</p>
                <p className="text-gray-600">{driver.phone}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Rating: {driver.rating || 'N/A'} | 
                  Total Earnings: ₾{driver.total_earnings || 0}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                driver.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                driver.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {driver.verification_status}
              </span>
              
              {driver.verification_status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateDriverStatus(driver.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateDriverStatus(driver.id, 'rejected')}
                    className="border-red-600 text-red-600"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              
              {(driver.id_document_url || driver.driving_license_url) && (
                <div className="flex gap-2 mt-2">
                  {driver.id_document_url && (
                    <a
                      href={driver.id_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      ID Doc
                    </a>
                  )}
                  {driver.driving_license_url && (
                    <a
                      href={driver.driving_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      License
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
      
      {drivers.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No drivers yet
        </div>
      )}
    </div>
  );
};

export default DriversManagement;