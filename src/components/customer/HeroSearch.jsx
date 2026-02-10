import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import LocationDropdown from '@/components/home/LocationDropdown';

const HeroSearch = ({ onSearch, compact = false, initialData }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const today = new Date().toISOString().split('T')[0];

  const [searchData, setSearchData] = useState({
    startLocation: null, // Now an object { id, name, lat, lng }
    endLocation: null,
    stops: [],
    date: today,
  });
  
  useEffect(() => {
    if (initialData) {
      setSearchData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);
  
  const addStop = () => {
    if (searchData.stops.length >= 3) {
      toast({ title: "Maximum stops reached", description: "You can add up to 3 stops." });
      return;
    }
    setSearchData({ ...searchData, stops: [...searchData.stops, null] });
  };
  
  const removeStop = (index) => {
    setSearchData({ ...searchData, stops: searchData.stops.filter((_, i) => i !== index) });
  };
  
  const updateStop = (index, value) => {
    const newStops = [...searchData.stops];
    newStops[index] = value;
    setSearchData({ ...searchData, stops: newStops });
  };
  
  const handleSearch = () => {
    // 1. Validation
    if (!searchData.startLocation) {
      toast({
        variant: 'destructive',
        title: 'Missing Origin',
        description: 'Please select a starting location.',
      });
      return;
    }

    if (!searchData.endLocation) {
      toast({
        variant: 'destructive',
        title: 'Missing Destination',
        description: 'Please select a destination.',
      });
      return;
    }

    if (!searchData.date) {
      toast({
        variant: 'destructive',
        title: 'Missing Date',
        description: 'Please select a date for your trip.',
      });
      return;
    }

    // 2. Prepare Query Params
    const params = new URLSearchParams();
    
    // We prefer ID if available, otherwise name (for custom locations potentially)
    if (searchData.startLocation.id) {
        params.append('from', searchData.startLocation.id);
    } else {
        params.append('fromName', searchData.startLocation.name || searchData.startLocation);
    }

    if (searchData.endLocation.id) {
        params.append('to', searchData.endLocation.id);
    } else {
        params.append('toName', searchData.endLocation.name || searchData.endLocation);
    }

    params.append('date', searchData.date);

    // Handle stops
    if (searchData.stops.length > 0) {
        const stopIds = searchData.stops
            .filter(s => s && s.id)
            .map(s => s.id)
            .join(',');
        if (stopIds) params.append('stops', stopIds);
    }

    // 3. Navigate
    navigate(`/search-results?${params.toString()}`);
    
    if (onSearch) onSearch(searchData);
  };

  // --- COMPACT MODE ---
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-4 md:p-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
             <div className="w-full relative">
                <LocationDropdown 
                  label={t('startLocation')}
                  placeholder="From..."
                  value={searchData.startLocation}
                  onChange={(v) => setSearchData({...searchData, startLocation: v})}
                  iconColor="text-green-600"
                />
                <div className="hidden md:block absolute left-5 top-14 bottom-[-16px] w-0.5 border-l-2 border-dashed border-gray-300 z-0"></div>
             </div>

             <div className="w-full">
                <LocationDropdown 
                  label={t('endLocation')}
                  placeholder="To..."
                  value={searchData.endLocation}
                  onChange={(v) => setSearchData({...searchData, endLocation: v})}
                  iconColor="text-red-500"
                />
             </div>
          </div>

          {searchData.stops.length > 0 && (
             <div className="flex flex-col gap-3 pl-4 md:pl-0">
               {searchData.stops.map((stop, index) => (
                  <div key={index} className="flex gap-2 animate-in slide-in-from-top-2">
                     <div className="flex-grow">
                       <LocationDropdown 
                          placeholder={`Stop ${index + 1}...`}
                          value={stop}
                          onChange={(v) => updateStop(index, v)}
                          iconColor="text-yellow-500"
                        />
                     </div>
                     <div className="flex items-end pb-1">
                        <Button variant="ghost" size="icon" onClick={() => removeStop(index)} className="h-10 w-10 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </Button>
                     </div>
                  </div>
               ))}
             </div>
          )}

           <Button variant="secondary" onClick={addStop} className="w-full bg-slate-500 text-white hover:bg-slate-600 h-10 border-none rounded-lg font-medium shadow-sm transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add stop
          </Button>

          <div className="flex flex-col md:flex-row gap-3 items-end">
             <div className="w-full md:w-64">
                <div className="relative">
                   <Label className="text-xs text-gray-400 font-bold mb-1 ml-1 block uppercase">{t('date')}</Label>
                   <div className="relative">
                       <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-white z-10 pointer-events-none mix-blend-difference" />
                       <Input 
                          type="date" 
                          className="h-10 pl-10 bg-slate-500 text-white border-none font-bold placeholder:text-gray-300 rounded-lg selection:bg-slate-600"
                          value={searchData.date} 
                          min={today}
                          onChange={(e) => setSearchData({...searchData, date: e.target.value})} 
                       />
                   </div>
                </div>
             </div>
             
             {/* Search Button for Compact Mode */}
             <div className="w-full md:w-auto">
                <Button onClick={handleSearch} className="w-full bg-green-600 hover:bg-green-700 text-white h-10 font-bold">
                    Search
                </Button>
             </div>
          </div>
        </div>
      </div>
    );
  }
  
  // --- HERO MODE ---
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationDropdown 
            label={t('startLocation')}
            placeholder="City, Airport, or Hotel..."
            value={searchData.startLocation}
            onChange={(v) => setSearchData({...searchData, startLocation: v})}
            iconColor="text-green-400"
            variant="dark"
          />
          
          <LocationDropdown 
            label={t('endLocation')}
            placeholder="Where are you going?"
            value={searchData.endLocation}
            onChange={(v) => setSearchData({...searchData, endLocation: v})}
            iconColor="text-red-400"
            variant="dark"
          />
        </div>

        {searchData.stops.map((stop, index) => (
          <div key={index} className="flex gap-2 animate-in slide-in-from-top-2">
              <div className="flex-grow">
                <LocationDropdown 
                  label={`Stop ${index + 1}`}
                  placeholder="Enter stop location..."
                  value={stop}
                  onChange={(v) => updateStop(index, v)}
                  iconColor="text-yellow-400"
                  variant="dark"
                />
              </div>
              <div className="flex items-end pb-1">
                <Button variant="ghost" size="icon" onClick={() => removeStop(index)} className="h-12 w-12 text-gray-400 hover:text-red-400 rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5 relative">
            <Label className="text-xs uppercase font-bold text-gray-400 mb-1 block">{t('date')}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <Input
                type="date"
                value={searchData.date}
                min={today}
                onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                className="h-12 pl-10 bg-white/10 border-white/20 text-white rounded-xl text-base hover:border-green-400/50 focus:border-green-400 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="md:col-span-3 relative">
              <Button variant="outline" onClick={addStop} className="w-full h-12 border-dashed border-white/20 text-gray-300 hover:text-green-400 hover:border-green-400/50 hover:bg-green-500/10 rounded-xl transition-all">
              <Plus className="w-4 h-4 mr-2" /> {t('addStop')}
            </Button>
          </div>

          <div className="md:col-span-4 relative">
              <Button onClick={handleSearch} className="w-full h-12 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 text-base transition-all hover:shadow-green-500/40 active:scale-[0.98]">
              {t('searchCars')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;