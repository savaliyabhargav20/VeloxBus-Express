import React, { useState } from 'react';
import { Filter, RotateCcw, Star, Zap, Wifi, ShieldAlert, Sparkles, Bus as BusIcon, Search } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { AMENITIES_LIST, BUS_OPERATORS, BUS_TYPES, GOVERNMENT_OPERATORS } from '../data/mockData';

export const BusFilterSidebar: React.FC = () => {
  const { searchFilters, setSearchFilters, searchBuses, formatPrice } = useBooking();
  const [operatorSearch, setOperatorSearch] = useState('');

  const timeSlots = [
    { id: 'morning', label: 'Morning (06:00 - 12:00)', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon (12:00 - 18:00)', icon: '☀️' },
    { id: 'evening', label: 'Evening (18:00 - 23:00)', icon: '🌆' },
    { id: 'night', label: 'Night (23:00 - 06:00)', icon: '🌙' }
  ];


  const filteredOperators = BUS_OPERATORS.filter(op =>
    op.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  const selectedGovOperator = searchFilters.operators.find(o => GOVERNMENT_OPERATORS.includes(o)) || '';

  const handleGovOperatorChange = (opValue: string) => {
    setSearchFilters(prev => {
      const withoutGov = prev.operators.filter(o => !GOVERNMENT_OPERATORS.includes(o));
      if (!opValue) {
        return { ...prev, operators: withoutGov };
      }
      return { ...prev, operators: [...withoutGov, opValue] };
    });
  };

  const handleBusTypeToggle = (type: string) => {
    setSearchFilters(prev => {
      const exists = prev.busTypes.includes(type);
      return {
        ...prev,
        busTypes: exists ? prev.busTypes.filter(t => t !== type) : [...prev.busTypes, type]
      };
    });
  };

  const handleOperatorToggle = (opName: string) => {
    setSearchFilters(prev => {
      const exists = prev.operators.includes(opName);
      return {
        ...prev,
        operators: exists ? prev.operators.filter(o => o !== opName) : [...prev.operators, opName]
      };
    });
  };

  const handleResetFilters = () => {
    setSearchFilters(prev => ({
      ...prev,
      priceRange: [0, 3000],
      busTypes: [],
      departureTimeSlots: [],
      amenities: [],
      operators: [],
      minRating: 0,
      sortBy: 'rating'
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Filter Buses</span>
        </div>
        <button
          onClick={handleResetFilters}
          className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Government Operators Dropdown */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">
          Government Operators
        </label>
        <select
          value={selectedGovOperator}
          onChange={(e) => handleGovOperatorChange(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="">All Government Operators</option>
          {GOVERNMENT_OPERATORS.map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      </div>

      {/* Bus Operators Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
            Bus Operators ({BUS_OPERATORS.length})
          </label>
          {searchFilters.operators.length > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              {searchFilters.operators.length} selected
            </span>
          )}
        </div>

        {/* Search Operator Input */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search operator..."
            value={operatorSearch}
            onChange={(e) => setOperatorSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="max-h-40 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
          {filteredOperators.slice(0, 15).map(opName => {
            const isChecked = searchFilters.operators.includes(opName);
            return (
              <label
                key={opName}
                className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleOperatorToggle(opName)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="truncate">{opName}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bus Types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
            Bus & Seating Types ({BUS_TYPES.length})
          </label>
          {searchFilters.busTypes.length > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              {searchFilters.busTypes.length} selected
            </span>
          )}
        </div>
        <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
          {BUS_TYPES.map(type => {
            const isChecked = searchFilters.busTypes.includes(type);
            return (
              <label
                key={type}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors border ${
                  isChecked
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBusTypeToggle(type)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="truncate">{type}</span>
                </div>
                {type.includes('Electric') && (
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                    Eco
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Maximum Price Filter */}
      <div>
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">Max Ticket Price</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatPrice(searchFilters.priceRange[1])}
          </span>
        </div>
        <input
          type="range"
          min={200}
          max={3000}
          step={50}
          value={searchFilters.priceRange[1]}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Number(e.target.value)] }))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 3.5, 4.0, 4.5].map(r => (
            <button
              key={r}
              onClick={() => setSearchFilters(prev => ({ ...prev, minRating: r }))}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-0.5 border ${
                searchFilters.minRating === r
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {r === 0 ? 'All' : `${r}+ ⭐`}
            </button>
          ))}
        </div>
      </div>

      {/* Bus Amenities */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">
          Popular Amenities
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES_LIST.slice(0, 6).map(a => (
            <span
              key={a.id}
              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-teal-500" />
              {a.name}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

