import React from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TourReviews = ({ reviews = [], rating, count }) => {
  // Mock reviews if empty
  const displayReviews = reviews.length > 0 ? reviews : [
      { id: 1, name: "Alexander K.", rating: 5, date: "2 weeks ago", text: "Absolutely stunning tour! The guide was very knowledgeable and the scenery was breathtaking." },
      { id: 2, name: "Maria S.", rating: 5, date: "1 month ago", text: "Well organized and comfortable transport. Highly recommend." },
      { id: 3, name: "John D.", rating: 4, date: "2 months ago", text: "Great experience overall, just wish we had more time at the first stop." }
  ];

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
         <h3 className="text-2xl font-heading font-bold text-gray-900">Reviews</h3>
         <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-xl">{rating}</span>
            <span className="text-gray-500">({count} reviews)</span>
         </div>
       </div>

       <div className="grid gap-6">
          {displayReviews.map((review) => (
             <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                         <User className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="font-bold text-gray-900">{review.name}</p>
                         <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                   </div>
                   <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                   </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">"{review.text}"</p>
             </div>
          ))}
       </div>

       <Button variant="outline" className="w-full">View All Reviews</Button>
    </div>
  );
};

export default TourReviews;