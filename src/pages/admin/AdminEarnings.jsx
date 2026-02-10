import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const AdminEarnings = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Earnings & Revenue</h1>
            <Card className="p-12 text-center text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">Financial Reports</h3>
                <p>Detailed revenue reports and payout management coming soon.</p>
            </Card>
        </div>
    );
};
export default AdminEarnings;