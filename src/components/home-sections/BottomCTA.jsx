import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const BottomCTA = () => {
  const { content } = useSiteContent('home', 'bottom_cta', DEFAULT_CONTENT.home.bottom_cta);

  return (
    <section className="relative h-[550px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover" alt="Georgia landscape" src={content.backgroundImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
      </div>
      
      <div className="relative z-10 text-center container-custom max-w-3xl px-6">
        <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 drop-shadow-lg leading-tight">
          {content.title}
        </h2>
        <p className="text-xl text-white/90 mb-10 leading-relaxed font-light drop-shadow-md max-w-2xl mx-auto">
          {content.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-green-600 hover:bg-green-500 text-white text-lg h-14 px-10 rounded-full shadow-xl shadow-green-900/40 hover:scale-105 transition-all duration-300 font-bold"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {content.buttonText} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-green-900 text-lg h-14 px-10 rounded-full hover:scale-105 transition-all duration-300 font-medium"
            onClick={() => window.location.href = '/contact'}
          >
            <Phone className="w-4 h-4 mr-2" /> {content.contactButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;