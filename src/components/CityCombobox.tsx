import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Check, Building2, Compass, ChevronDown } from 'lucide-react';
import { INDIA_LOCATIONS, ALL_INDIAN_CITY_OBJECTS, INDIAN_STATES } from '../data/indiaLocations';

interface CityComboboxProps {
  label: string;
  value: string;
  onChange: (city: string) => void;
  iconColor?: string;
  placeholder?: string;
}

const POPULAR_HUBS = [
  'Visakhapatnam', 'Vijayawada', 'Mumbai', 'Pune',
  'Bengaluru', 'Hyderabad', 'Chennai', 'Delhi',
  'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad'
];

export const CityCombobox: React.FC<CityComboboxProps> = ({
  label,
  value,
  onChange,
  iconColor = 'text-emerald-500',
  placeholder = 'Select city'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Find state for currently selected value
  const currentCityObj = ALL_INDIAN_CITY_OBJECTS.find(
    c => c.city.toLowerCase() === value.toLowerCase()
  );

  // Filter cities based on query and selected state
  const filteredCities = ALL_INDIAN_CITY_OBJECTS.filter(item => {
    const matchesQuery =
      item.city.toLowerCase().includes(query.toLowerCase()) ||
      item.state.toLowerCase().includes(query.toLowerCase());
    const matchesState = selectedState === 'ALL' || item.state === selectedState;
    return matchesQuery && matchesState;
  });

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      
      {/* Clickable Display Field */}
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all flex flex-col justify-center"
      >
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 cursor-pointer">
          {label}
        </label>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <div className="truncate">
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                {value || placeholder}
              </span>
              {currentCityObj && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block -mt-0.5">
                  {currentCityObj.state}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </div>
      </div>

      {/* Dropdown Overlay Modal / Popover */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">Select {label} City</h3>
                  <p className="text-[11px] text-slate-400">Cities across 36 States & Union Territories of India</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city or state (e.g. Visakhapatnam, Maharashtra, Patna...)"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* State Filter Selector */}
              <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap">Filter State:</span>
                <button
                  onClick={() => setSelectedState('ALL')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedState === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  All India ({ALL_INDIAN_CITY_OBJECTS.length})
                </button>
                {INDIAN_STATES.map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                      selectedState === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Popular Hubs (shown when no search query) */}
              {!query && selectedState === 'ALL' && (
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-500" />
                    Popular Metro Travel Hubs
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POPULAR_HUBS.map(city => {
                      const cObj = ALL_INDIAN_CITY_OBJECTS.find(item => item.city === city);
                      const isSelected = value.toLowerCase() === city.toLowerCase();
                      return (
                        <button
                          key={city}
                          onClick={() => handleSelect(city)}
                          className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                          }`}
                        >
                          <span className="text-xs font-bold block truncate">{city}</span>
                          <span className="text-[9px] text-slate-400 block truncate">{cObj?.state}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* City List */}
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  {selectedState === 'ALL' ? 'All Cities' : `Cities in ${selectedState}`} ({filteredCities.length})
                </p>

                {filteredCities.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs">No cities found matching "{query}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredCities.map((item) => {
                      const isSelected = value.toLowerCase() === item.city.toLowerCase();
                      return (
                        <button
                          key={`${item.state}-${item.city}`}
                          onClick={() => handleSelect(item.city)}
                          className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-extrabold block">{item.city}</span>
                            <span className={`text-[10px] block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {item.state}
                            </span>
                          </div>

                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
