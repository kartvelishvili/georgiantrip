import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { DEFAULT_CONTENT } from '@/lib/siteContentService';

const Testimonials = () => {
  const { content } = useSiteContent('home', 'testimonials', DEFAULT_CONTENT.home.testimonials);
  const reviews = content.reviews || [];

  return (
    <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm font-bold mb-4 border border-green-500/20">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-5">{content.title}</h2>
          <div className="flex justify-center items-center gap-3">
            <div className="flex text-yellow-400">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
            </div>
            <span className="font-bold text-lg">{content.rating}</span>
            <span className="text-gray-400 text-sm">from {content.reviewCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white/[0.04] backdrop-blur-sm border border-white/10 p-8 rounded-2xl relative hover:bg-white/[0.08] hover:border-green-500/20 transition-all duration-500 group">
              <Quote className="absolute top-6 right-6 text-green-500/10 w-12 h-12 rotate-180 group-hover:text-green-500/20 transition-colors" />
              
              <div className="flex text-yellow-400 mb-5">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
              </div>
              
              <p className="text-gray-300 italic mb-8 leading-relaxed text-[15px]">"{review.text}"</p>
              
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-green-900/30">
                   {review.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{review.name}</div>
                  <div className="text-xs text-gray-500">{review.location} {review.date && `· ${review.date}`}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;