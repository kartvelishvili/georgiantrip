import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const VerificationBadge = ({ status }) => {
  switch(status) {
    case 'approved':
    case 'verified':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0 flex items-center gap-1 shadow-none"><CheckCircle className="w-3 h-3"/> Verified</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="flex items-center gap-1 shadow-none bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3"/> Rejected</Badge>;
    default:
      return <Badge variant="secondary" className="flex items-center gap-1 shadow-none bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3"/> Pending Verification</Badge>;
  }
};

export default VerificationBadge;