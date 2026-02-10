import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check } from 'lucide-react';

const BenefitsSection = () => {
  const { t } = useLanguage();

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('englishDrivers'),
    'Free Child Seats',
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold mb-10 text-center">{t('benefitsTitle')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-medium text-gray-800">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;