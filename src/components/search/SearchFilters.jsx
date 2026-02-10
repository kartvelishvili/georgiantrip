import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SearchFilters = ({ filters, onChange }) => {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-20">
      <div className="container-custom">
        <div className="flex flex-col gap-4">
            {/* Top Row: Quick Toggles */}
            <div className="flex flex-wrap items-center gap-2">
                <Select value={filters.class} onValueChange={(v) => updateFilter('class', v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[120px] h-9 text-sm bg-white border-gray-200 rounded-lg">
                        <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Class</SelectItem>
                        <SelectItem value="Economy">Economy</SelectItem>
                        <SelectItem value="Comfort">Comfort</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.carType} onValueChange={(v) => updateFilter('carType', v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[130px] h-9 text-sm bg-white border-gray-200 rounded-lg">
                        <SelectValue placeholder="Car type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                        <SelectItem value="Minivan">Minivan</SelectItem>
                    </SelectContent>
                </Select>
                
                 <Select value={filters.fuelType} onValueChange={(v) => updateFilter('fuelType', v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[130px] h-9 text-sm bg-white border-gray-200 rounded-lg">
                        <SelectValue placeholder="Fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Fuel</SelectItem>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Gas">Gas</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.passengers} onValueChange={(v) => updateFilter('passengers', v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-[160px] h-9 text-sm bg-white border-gray-200 rounded-lg">
                        <SelectValue placeholder="Passengers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Number</SelectItem>
                        <SelectItem value="3">3+ Passengers</SelectItem>
                        <SelectItem value="4">4+ Passengers</SelectItem>
                        <SelectItem value="5">5+ Passengers</SelectItem>
                        <SelectItem value="6">6+ Passengers</SelectItem>
                    </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-3 h-9 bg-white cursor-pointer hover:border-gray-300" onClick={() => updateFilter('petsAllowed', !filters.petsAllowed)}>
                    <Checkbox id="pets" checked={filters.petsAllowed} onCheckedChange={(c) => updateFilter('petsAllowed', c)} />
                    <Label htmlFor="pets" className="text-sm cursor-pointer font-medium text-gray-600">Pets allowed</Label>
                </div>

                <div className="flex-grow min-w-[200px] relative">
                     <Input 
                        placeholder="Driver's name or car brand" 
                        className="h-9 pr-8 bg-white border-gray-200 rounded-lg"
                        value={filters.searchQuery || ''}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                     />
                     <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-green-500" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;