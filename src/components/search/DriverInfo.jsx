import React from 'react';
import { Star, ShieldCheck, MessageCircle } from 'lucide-react';

const DriverInfo = ({ driver }) => {
  // Defensive check: If driver data is missing or null, render a fallback or nothing
  if (!driver) {
    return (
      <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs font-medium">N/A</span>
        </div>
        <div className="text-sm text-gray-500">Driver info unavailable</div>
      </div>
    );
  }

  // Safe access to languages array
  const mainLang = driver.languages_spoken && driver.languages_spoken.length > 0 
    ? driver.languages_spoken[0] 
    : 'English';

  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200">
           {driver.avatar_url ? (
             <img src={driver.avatar_url} alt={driver.first_name || 'Driver'} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-lg">
                {(driver.first_name?.[0]) || '?'}
             </div>
           )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="font-bold text-gray-900 text-base truncate">
             {driver.first_name || 'Unknown Driver'}
          </h4>
          {driver.verification_status === 'approved' && (
             <ShieldCheck className="w-4 h-4 text-green-500 fill-green-100" />
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs">
           <div className="flex items-center gap-1 text-yellow-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{driver.rating || 'New'}</span>
           </div>
           <span className="text-gray-400">•</span>
           <span className="text-gray-500">{driver.reviews_count || 0} Reviews</span>
        </div>

        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
            <MessageCircle className="w-3 h-3" />
            <span className="truncate">{mainLang}</span>
        </div>
      </div>
    </div>
  );
};

export default DriverInfo;