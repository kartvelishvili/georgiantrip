import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, CheckCircle2, MessageCircle, ShieldCheck, Headphones as Headset, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const iconMap = { DollarSign, CheckCircle2, MessageCircle, ShieldCheck, Headset };

const ValueIcons = () => {
  const { t } = useLanguage();
  const { content } = useSiteContent('home', 'value_icons', DEFAULT_CONTENT.home.value_icons);

  const defaultValues = [
    { icon: 'DollarSign', title: t('noFees'), desc: t('noFeesDesc') || "Transparent pricing with no hidden charges or surprises." },
    { icon: 'CheckCircle2', title: t('freeCancel'), desc: t('freeCancelDesc') || "Flexible bookings with free cancellation up to 24 hours." },
    { icon: 'MessageCircle', title: t('englishDrivers'), desc: t('englishDriversDesc') || "Communication is easy with our English-speaking drivers." },
    { icon: 'ShieldCheck', title: t('verifiedDrivers') || "Verified Drivers", desc: t('verifiedDriversDesc') || "Every driver is vetted for safety and professionalism." },
    { icon: 'Headset', title: t('support247') || "24/7 Support", desc: t('support247Desc') || "We are here to help you anytime, anywhere in Georgia." },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.06),transparent_70%)]" />
      <div className="container-custom relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4 tracking-wide">
            <Award className="w-4 h-4" />
            {content.title ? 'Our Promise' : 'Our Promise'}
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
            {content.title || 'Why Choose GeorgianTrip?'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.subtitle || 'We provide the safest, most comfortable way to explore Georgia\'s beautiful landscapes.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {defaultValues.map((item, index) => {
            const Icon = iconMap[item.icon] || DollarSign;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-green-200 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-5 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueIcons;