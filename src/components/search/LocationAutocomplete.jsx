import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

const LocationAutocomplete = ({ 
  value, // Expecting { id, name, lat, lng } or string (legacy)
  onChange, 
  placeholder, 
  label, 
  iconColor = "text-gray-500",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Use the custom hook for debouncing
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Initialize input value
  useEffect(() => {
    if (value && typeof value === 'object') {
      setInputValue(value.name || '');
    } else if (typeof value === 'string') {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect triggered by debounced value changes
  useEffect(() => {
    const searchLocations = async () => {
      // Skip if empty or if the input matches the currently selected value (to avoid searching when just displaying)
      if (!debouncedInputValue || (value && typeof value === 'object' && value.name === debouncedInputValue)) {
         return; 
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name_en, name_ka, name_ru, lat, lng')
          .eq('is_active', true)
          .or(`name_en.ilike.%${debouncedInputValue}%,name_ka.ilike.%${debouncedInputValue}%,name_ru.ilike.%${debouncedInputValue}%`)
          .order('priority', { ascending: false })
          .order('name_en', { ascending: true })
          .limit(10);

        if (error) throw error;
        setSuggestions(data || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Error searching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedInputValue.length > 1) {
        searchLocations();
    }
  }, [debouncedInputValue]); // Only re-run when the debounced value changes

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // If user clears input, reset
    if (e.target.value === '') {
        onChange(null);
    }
  };

  const handleSelect = (location) => {
    const selected = {
      id: location.id,
      name: location.name_en, // Defaulting to EN for now, could be dynamic based on locale
      lat: location.lat,
      lng: location.lng
    };
    setInputValue(selected.name);
    onChange(selected);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="font-bold text-gray-900 bg-yellow-100">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      {label && <Label className="text-xs text-gray-400 font-bold mb-1 ml-1 block uppercase">{label}</Label>}
      <div className="relative">
        <MapPin className={cn("absolute left-3 top-3.5 w-5 h-5 z-10", iconColor)} />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 1 && setIsOpen(true)}
          placeholder={placeholder}
          className="h-12 pl-10 pr-10 bg-white border-gray-200 focus:ring-green-600 focus:border-green-600 rounded-xl shadow-sm transition-shadow text-base"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {loading && (
             <div className="absolute right-10 top-3.5">
                 <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
             </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-100">
          <ul className="py-1">
            {suggestions.map((location) => (
              <li
                key={location.id}
                onClick={() => handleSelect(location)}
                className="px-4 py-2.5 hover:bg-green-50 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                    <span className="text-gray-900 font-medium">
                        {highlightMatch(location.name_en, inputValue)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 ml-6">
                      {/* Added optional chaining and fallback to prevent crash if lat/lng is null */}
                      {location.lat?.toFixed(4) || '0.0000'}, {location.lng?.toFixed(4) || '0.0000'}
                  </span>
                </div>
                {value?.id === location.id && <Check className="w-4 h-4 text-green-600" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;