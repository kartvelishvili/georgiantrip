import React from 'react';
import { Users, Map, Trophy, Calendar } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const ICON_MAP = [Calendar, Users, Map, Trophy];

const StatCard = ({ icon: Icon, value, label, description }) => (
  <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
     <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 text-green-400 mb-4">
        <Icon className="w-7 h-7" />
     </div>
     <div className="text-4xl font-bold text-white mb-2">{value}</div>
     <div className="text-green-300 font-bold uppercase text-sm mb-2">{label}</div>
     <div className="text-gray-400 text-sm">{description}</div>
  </div>
);

const StatsSection = () => {
  const { content } = useSiteContent('about', 'stats', DEFAULT_CONTENT.about.stats);

  const stats = (content.items || []).map((item, i) => ({
    icon: ICON_MAP[i % ICON_MAP.length],
    value: item.value,
    label: item.label,
    description: item.description,
  }));

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
       {/* Subtle gradient background */}
       <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
       <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
       </div>

       <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
             ))}
          </div>
       </div>
    </section>
  );
};

export default StatsSection;