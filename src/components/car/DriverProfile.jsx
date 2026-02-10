import React from 'react';
import { Star, ShieldCheck, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DriverProfile = ({ driver, reviews = [], onContact }) => {
  if (!driver) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-green-50 overflow-hidden">
            <img 
              src={driver.avatar_url || 'https://placehold.co/200x200?text=Driver'} 
              alt={driver.first_name} 
              className="w-full h-full object-cover"
            />
          </div>
          {driver.verification_status === 'approved' && (
             <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                <ShieldCheck className="w-6 h-6 text-green-600 fill-green-100" />
             </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {driver.first_name} {driver.last_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                 <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-0.5 rounded-full text-sm">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    {driver.rating || 'New'}
                 </div>
                 <span className="text-gray-400 text-sm">({driver.reviews_count || 0} reviews)</span>
              </div>
            </div>
            
            <Button variant="outline" onClick={onContact}>
               Contact Driver
            </Button>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
            {driver.bio || "Professional driver with experience in tourism transfers. Ensures safe driving and comfortable trips across Georgia."}
          </p>

          <div className="flex gap-4 text-sm text-gray-500 pt-2">
             <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{driver.phone ? `+995 5** *** *${driver.phone.slice(-2)}` : 'Phone hidden'}</span>
             </div>
             <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>Speaks: {driver.languages_spoken?.join(', ') || 'English, Georgian'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Mini Reviews */}
      {reviews.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="font-bold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
             {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                   <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-800">{review.passenger_name || 'Passenger'}</span>
                      <div className="flex gap-0.5">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                         ))}
                      </div>
                   </div>
                   <p className="text-sm text-gray-600">{review.comment}</p>
                   <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
             ))}
          </div>
          <Button variant="link" className="mt-2 pl-0 text-green-600">View all reviews</Button>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;