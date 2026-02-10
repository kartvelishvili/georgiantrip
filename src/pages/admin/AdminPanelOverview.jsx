
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Map, 
  Calendar, 
  DollarSign, 
  Tag, 
  Settings, 
  ArrowRight 
} from 'lucide-react';

const AdminPanelOverview = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Driver Management',
      description: 'Manage drivers, review applications, and track verification status.',
      icon: Users,
      route: '/paneli/drivers',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Bookings',
      description: 'View and manage all customer bookings and trip details.',
      icon: Calendar,
      route: '/paneli/bookings',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Finances',
      description: 'Track earnings, commissions, and payout history.',
      icon: DollarSign,
      route: '/paneli/finances',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Tours',
      description: 'Create and manage tour packages and itineraries.',
      icon: Tag,
      route: '/paneli/tours',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Locations & Transfers',
      description: 'Manage pickup locations and transfer routes.',
      icon: Map,
      route: '/paneli/locations',
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Global Settings',
      description: 'Configure platform settings, pricing rules, and content.',
      icon: Settings,
      route: '/paneli/settings',
      color: 'text-gray-600',
      bg: 'bg-gray-50'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Admin Panel Overview</h1>
        <p className="text-gray-500 text-lg">
          Welcome to the central control hub. Select a module below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-none shadow-sm ring-1 ring-gray-200"
            onClick={() => navigate(section.route)}
          >
            <CardContent className="p-8">
              <div className={`w-14 h-14 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <section.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {section.description}
              </p>
              <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-green-600">
                Access Module <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPanelOverview;
