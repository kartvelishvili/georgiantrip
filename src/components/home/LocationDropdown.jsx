import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Check, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const LocationDropdown = ({ 
  value, // { id, name, lat, lng } or null
  onChange, 
  placeholder, 
  label, 
  iconColor = "text-gray-500",
  className,
  variant = "light"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const { currentLanguage } = useLanguage();

  // 1. Fetch ALL locations once on mount
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name_en, name_ka, name_ru, lat, lng, priority')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('name_en', { ascending: true });

        if (error) throw error;
        
        const mappedData = (data || []).map(loc => ({
            id: loc.id,
            name: loc[`name_${currentLanguage}`] || loc.name_en, // Localize name
            original: loc 
        }));

        setAllLocations(mappedData);
        setFilteredLocations(mappedData);
      } catch (err) {
        console.error('Error loading locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [currentLanguage]);

  // 2. Sync input with prop value
  useEffect(() => {
    if (value && typeof value === 'object') {
      setInputValue(value.name || '');
    } else if (!value) {
      setInputValue('');
    }
  }, [value]);

  // 3. Filter logic - Runs when input changes
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    setIsOpen(true);

    if (!text.trim()) {
      setFilteredLocations(allLocations);
      if (value) onChange(null); // Clear selection if text cleared
      return;
    }

    const lower = text.toLowerCase();
    const filtered = allLocations.filter(loc => 
      loc.name.toLowerCase().includes(lower)
    );
    setFilteredLocations(filtered);
  };

  // 4. Handle clicks
  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setIsOpen(false);
      // If closing and input doesn't match selection, revert or clear? 
      // User might have typed half a word. 
      // For now, we leave the text but no selection is made unless clicked.
      if (value && inputValue !== value.name) {
         setInputValue(value.name); // Revert to valid name
      } else if (!value && inputValue) {
         setInputValue(''); // Clear invalid text
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, inputValue]);

  const handleInputFocus = () => {
    setIsOpen(true);
    // On focus, if we have text that matches the value, we might want to show all options
    // or keep filtering. Let's keep filtering if text exists, but ensure list is populated.
    if (!inputValue) {
        setFilteredLocations(allLocations);
    } else {
        // Re-run filter to be safe
        const lower = inputValue.toLowerCase();
        const filtered = allLocations.filter(loc => loc.name.toLowerCase().includes(lower));
        setFilteredLocations(filtered);
    }
  };

  const handleSelect = (loc) => {
    const selected = {
      id: loc.id,
      name: loc.name,
      lat: loc.original.lat,
      lng: loc.original.lng
    };
    setInputValue(selected.name);
    onChange(selected);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    onChange(null);
    setFilteredLocations(allLocations); // Reset filter
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      {label && <Label className={cn("text-xs font-bold mb-1 ml-1 block uppercase", variant === "dark" ? "text-gray-400" : "text-gray-400")}>{label}</Label>}
      
      <div className="relative group">
        <MapPin className={cn("absolute left-3 top-3.5 w-5 h-5 z-10 transition-colors", 
             isOpen ? (variant === "dark" ? "text-green-400" : "text-green-600") : iconColor
        )} />
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputFocus}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            "h-12 pl-10 pr-10 rounded-xl transition-all text-base cursor-pointer",
            variant === "dark" 
              ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-400/20 focus:border-green-400 shadow-none"
              : "bg-white border-gray-200 focus:ring-2 focus:ring-green-600/20 focus:border-green-600 shadow-sm"
          )}
          autoComplete="off"
        />

        <div className="absolute right-3 top-3.5 flex items-center gap-1">
            {loading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
            
            {!loading && inputValue && (
            <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none p-0.5 rounded-full hover:bg-red-50"
            >
                <X className="w-4 h-4" />
            </button>
            )}
            
            {!loading && (
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
            )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-[300px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
          {filteredLocations.length > 0 ? (
            <ul className="py-1">
              {filteredLocations.map((loc) => (
                <li
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={cn(
                    "px-4 py-3 hover:bg-green-50 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0",
                    value?.id === loc.id && "bg-green-50/50"
                  )}
                >
                  <div className="flex flex-col">
                    <span className={cn("text-gray-900 font-medium group-hover:text-green-700 transition-colors",
                         value?.id === loc.id && "text-green-700 font-semibold"
                    )}>
                      {loc.name}
                    </span>
                    {/* Optional: Show distance or region if available in future */}
                  </div>
                  {value?.id === loc.id && <Check className="w-4 h-4 text-green-600" />}
                </li>
              ))}
            </ul>
          ) : (
             <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No locations found.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;