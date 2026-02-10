import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const FAQAccordion = () => {
  const { content } = useSiteContent('home', 'faq', DEFAULT_CONTENT.home.faq);
  const items = content.items || [];

  return (
    <section className="py-24 bg-gray-50 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold mb-4">
            <HelpCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" /> FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
            {content.title}
          </h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-gray-200 rounded-xl px-6 overflow-hidden data-[state=open]:shadow-md data-[state=open]:border-green-200 transition-all">
              <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-green-600 py-5 text-[15px]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQAccordion;