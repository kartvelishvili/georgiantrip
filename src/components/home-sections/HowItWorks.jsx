
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { 
      number: 1, 
      title: "Choose Your Route", 
      desc: "Select your pick-up and drop-off locations, add stops, and choose your dates.",
      image: "https://images.unsplash.com/photo-1624632731086-4f6c4424367f?w=400" 
    },
    { 
      number: 2, 
      title: "Select Driver", 
      desc: "Browse driver profiles, reviews, and cars to find your perfect match.",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400" 
    },
    { 
      number: 3, 
      title: "Confirm Details", 
      desc: "Book instantly without prepayment. You'll receive immediate confirmation.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" 
    },
    { 
      number: 4, 
      title: "Enjoy Your Ride", 
      desc: "Meet your driver and enjoy a comfortable, safe journey through Georgia.",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" 
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">{t('howItWorks')}</h2>
          <p className="text-gray-600">Your journey in 4 simple steps</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-100 -z-10"></div>

          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center group">
              {/* Number Bubble */}
              <div className="w-24 h-24 relative mb-6 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center shadow-sm group-hover:border-green-100 transition-colors z-10">
                 <span className="text-3xl font-bold text-green-600">{step.number}</span>
                 <div className="absolute -bottom-2 bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Step</div>
              </div>

              {/* Image Card */}
              <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity hidden md:block">
                 <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
              </div>

              <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[250px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
