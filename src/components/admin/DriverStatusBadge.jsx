
import React from 'react';
import { Badge } from '@/components/ui/badge';

const DriverStatusBadge = ({ status, verificationStatus }) => {
  if (status === 'blocked') {
    return <Badge className="bg-red-500 hover:bg-red-600">Blocked</Badge>;
  }

  // Check verification status first if status is active but verification is pending
  if (verificationStatus === 'pending') {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pending Verification</Badge>;
  }

  if (verificationStatus === 'rejected') {
    return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
  }

  if (status === 'active' && verificationStatus === 'approved') {
    return <Badge className="bg-blue-600 hover:bg-blue-700">Active</Badge>;
  }

  // Fallback/Default
  return <Badge variant="outline" className="capitalize">{status || 'Unknown'}</Badge>;
};

export default DriverStatusBadge;
