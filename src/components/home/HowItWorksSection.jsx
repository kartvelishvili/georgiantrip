import React from 'react';
import { Search, Car, CalendarCheck, Smile } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const defaultIcons = [Search, Car, CalendarCheck, Smile];

const HowItWorksSection = () => {
  const { content } = useSiteContent('home', 'how_it_works', DEFAULT_CONTENT.home.how_it_works);

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden" id="how-it-works">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">{content.title}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{content.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-200 via-green-300 to-green-200" />

          {(content.steps || []).map((step, index) => {
            const Icon = defaultIcons[index] || Search;
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 flex items-center justify-center mb-6 shadow-sm group-hover:shadow-lg group-hover:shadow-green-100/50 transition-all duration-500 group-hover:-translate-y-1">
                    <Icon className="w-10 h-10 text-green-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-green-600/30">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-[260px]">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;