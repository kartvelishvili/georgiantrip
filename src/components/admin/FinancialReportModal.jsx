
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

const FinancialReportModal = ({ isOpen, onClose, driver, financialData }) => {
  if (!driver || !financialData) return null;

  const handleExportCSV = () => {
    // Basic CSV generation logic
    const headers = ['Date', 'Booking ID', 'Amount', 'Type', 'Status'];
    const rows = financialData.history?.map(item => [
      format(new Date(item.date), 'yyyy-MM-dd'),
      item.bookingId || '-',
      item.amount,
      item.type,
      item.status
    ]) || [];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${driver.last_name}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Financial Report: {driver.first_name} {driver.last_name}</DialogTitle>
          <DialogDescription>Detailed earnings and payment history.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-xl font-bold text-green-600">₾{financialData.totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Paid to Admin</p>
            <p className="text-xl font-bold text-blue-600">₾{financialData.paidToAdmin.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Balance Due</p>
            <p className={`text-xl font-bold ${financialData.balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              ₾{financialData.balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Recent Transactions</h4>
          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialData.history && financialData.history.length > 0 ? (
                  financialData.history.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>₾{item.amount}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                      No transaction history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialReportModal;
