import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAboutContent } from '@/lib/aboutService';
import AboutHeroEditor from '@/components/admin/AboutHeroEditor';
import AboutTeamEditor from '@/components/admin/AboutTeamEditor';
import { Loader2, Image as ImageIcon, Users, BookOpen } from 'lucide-react';

const AdminAboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
      setLoading(true);
      try {
          const content = await getAboutContent();
          setData(content);
      } catch (error) {
          console.error("Failed to fetch about content", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-heading">About Page Management</h1>
       <p className="text-gray-500">Manage content, images, and team members for the About Us page.</p>

       <Tabs defaultValue="hero">
          <TabsList>
             <TabsTrigger value="hero"><ImageIcon className="w-4 h-4 mr-2"/>Hero Section</TabsTrigger>
             <TabsTrigger value="team"><Users className="w-4 h-4 mr-2"/>Team Members</TabsTrigger>
             {/* Other tabs can be added later as requested */}
          </TabsList>
          
          <TabsContent value="hero" className="mt-6">
              <AboutHeroEditor data={data?.hero} onUpdate={fetchData} />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
              <AboutTeamEditor members={data?.team} onUpdate={fetchData} />
          </TabsContent>
       </Tabs>
    </div>
  );
};

export default AdminAboutPage;