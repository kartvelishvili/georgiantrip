import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, RefreshCcw } from 'lucide-react';

const SmsHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sms_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (data) setLogs(data);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent SMS Logs</h3>
        <button onClick={fetchLogs} className="p-2 hover:bg-gray-100 rounded-full">
          <RefreshCcw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[40%]">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No SMS logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>{log.recipient_phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.recipient_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={log.status === 'sent' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-gray-500" title={log.message}>
                    {log.message}
                    {log.error_message && (
                      <div className="text-red-500 mt-1">{log.error_message}</div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SmsHistory;