import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPhoneNumbers from '@/components/admin/AdminPhoneNumbers';
import SmsTemplates from '@/components/admin/SmsTemplates';
import SmsHistory from '@/components/admin/SmsHistory';
import SmsApiConfig from '@/components/admin/SmsApiConfig';
import { CheckCircle } from 'lucide-react';

const AdminSmsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">SMS Settings</h1>
          <p className="text-gray-500">Manage SMS notifications via SMS Office</p>
        </div>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
           <CheckCircle className="w-4 h-4" /> Service Active
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="config">API Configuration</TabsTrigger>
          <TabsTrigger value="phones">Admin Phones</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <SmsApiConfig />
        </TabsContent>

        <TabsContent value="phones">
          <Card className="p-6">
            <AdminPhoneNumbers />
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-6">
            <SmsTemplates />
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <SmsHistory />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSmsPage;