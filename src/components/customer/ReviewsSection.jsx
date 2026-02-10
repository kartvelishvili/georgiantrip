import React from 'react';
import { Star, Quote } from 'lucide-react';

const ReviewsSection = () => {
  const reviews = [
    { name: 'Sarah J.', country: 'UK', rating: 5, text: 'The driver Giorgi was amazing. Very safe driving and he stopped whenever we wanted to take photos.', date: 'Oct 2023' },
    { name: 'Michael B.', country: 'Germany', rating: 5, text: 'Much better than taking a marshrutka. Comfortable car and fair price.', date: 'Sep 2023' },
    { name: 'Elena K.', country: 'Russia', rating: 5, text: 'Отличный сервис. Водитель Леван встретил в аэропорту вовремя.', date: 'Nov 2023' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8">
           Latest Reviews
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {reviews.map((review, i) => (
             <div key={i} className="bg-gray-50 rounded-2xl p-6 relative">
                <Quote className="absolute top-4 right-4 text-green-100 w-8 h-8 rotate-180" />
                <div className="flex text-yellow-400 mb-3">
                   {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3 italic">
                   "{review.text}"
                </p>
                <div className="flex justify-between items-center mt-auto border-t border-gray-200 pt-3">
                   <div className="font-bold text-gray-900 text-sm">{review.name}</div>
                   <div className="text-xs text-gray-400">{review.date}</div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;