import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, User, FileText, CheckCircle, Car, Smile } from 'lucide-react';

const HowToOrder = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: MapPin, title: 'Choose route', desc: 'Select pick-up and drop-off locations' },
    { icon: User, title: 'Choose driver', desc: 'Compare prices and reviews' },
    { icon: FileText, title: 'Enter details', desc: 'Provide contact information' },
    { icon: CheckCircle, title: 'Confirm', desc: 'Instant confirmation, no prepayment' },
    { icon: Car, title: 'Driver arrives', desc: 'Meet your driver at the pickup point' },
    { icon: Smile, title: 'Enjoy', desc: 'Relax and enjoy your safe ride' },
  ];

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container-custom">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">
           How to order a transfer?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           {steps.map((step, index) => (
             <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300">
                   <step.icon className="w-6 h-6" />
                </div>
                <div className="mb-1 bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-2">{step.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;