import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';

const InformationalSection = () => {
  const { t } = useLanguage();

  const articles = [
    {
      image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600',
      title: 'Top 10 Places to Visit in Georgia',
      desc: 'Discover the hidden gems and popular spots that make Georgia unique.'
    },
    {
      image: 'https://images.unsplash.com/photo-1533555280286-30c14b3e8e7a?w=600',
      title: 'Georgian Wine Guide',
      desc: 'Everything you need to know about the 8000-year history of winemaking.'
    },
    {
      image: 'https://images.unsplash.com/photo-1605218427306-633ba8729d53?w=600',
      title: 'Safety Tips for Travelers',
      desc: 'How to stay safe and comfortable during your trip to the Caucasus.'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="flex flex-col gap-4 group cursor-pointer">
              <div className="rounded-2xl overflow-hidden h-56 shadow-sm">
                 <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                 />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">{article.title}</h3>
                <p className="text-gray-600 mb-2 leading-relaxed">{article.desc}</p>
                <div className="flex items-center text-green-600 font-medium text-sm">
                   {t('readMore')} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InformationalSection;