import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const CTASection = () => {
  const { content } = useSiteContent('about', 'cta', DEFAULT_CONTENT.about.cta);

  return (
    <section className="py-24 relative overflow-hidden">
       {/* Background Image */}
       <div className="absolute inset-0 z-0">
          <img 
             src={`${content.backgroundImage}?auto=format&fit=crop&q=80&w=1920`}
             alt="Georgian Mountains Sunset" 
             className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-950/80" />
       </div>

       <div className="container-custom relative z-10 text-center text-white">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold mb-6 tracking-wide border border-white/20">
            <Sparkles className="w-4 h-4" />
            Start Your Journey
          </span>

          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
             {content.title}
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
             {content.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link to="/tours">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-green-900/20 transition-all duration-300">
                   {content.button1Text || 'Explore Tours'} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
             </Link>
             <Link to="/contact">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 rounded-full px-8 h-14 text-lg w-full sm:w-auto transition-all duration-300">
                   {content.button2Text || 'Contact Us'} <Mail className="w-5 h-5 ml-2" />
                </Button>
             </Link>
          </div>
       </div>
    </section>
  );
};

export default CTASection;