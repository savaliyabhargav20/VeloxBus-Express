import React from 'react';
import { Calendar, ArrowRightLeft, Search, Sparkles, Shield, Clock } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { CityCombobox } from './CityCombobox';
import { POPULAR_INDIAN_ROUTES } from '../data/indiaLocations';

export const HeroSearch: React.FC = () => {
  const { searchFilters, setSearchFilters, searchBuses, loadingBuses } = useBooking();

  const handleSwapCities = () => {
    setSearchFilters(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  const handleQuickDate = (offsetDays: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const dateStr = date.toISOString().split('T')[0];
    setSearchFilters(prev => ({ ...prev, date: dateStr }));
  };

  const handlePopularRouteClick = (source: string, destination: string) => {
    setSearchFilters(prev => ({
      ...prev,
      source,
      destination
    }));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Banner Title */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guaranteed Lowest Fares & Zero Booking Fee</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Find & Book Bus Tickets In Seconds
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Search 10,000+ luxury coaches, Sleeper berths, and electric express buses across all Indian states with live GPS tracking.
          </p>
        </div>

        {/* Search Widget Card */}
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200/20 backdrop-blur-md">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Origin City */}
            <div className="md:col-span-4">
              <CityCombobox
                label="From (Origin)"
                value={searchFilters.source}
                onChange={(city) => setSearchFilters(prev => ({ ...prev, source: city }))}
                iconColor="text-emerald-500"
                placeholder="Select origin city"
              />
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center -my-1 md:my-0 z-10">
              <button
                onClick={handleSwapCities}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md hover:rotate-180 transition-all duration-300"
                title="Swap From and To Cities"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination City */}
            <div className="md:col-span-4">
              <CityCombobox
                label="To (Destination)"
                value={searchFilters.destination}
                onChange={(city) => setSearchFilters(prev => ({ ...prev, destination: city }))}
                iconColor="text-rose-500"
                placeholder="Select destination city"
              />
            </div>

            {/* Date Picker */}
            <div className="md:col-span-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-colors h-[68px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Journey</label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    onClick={() => handleQuickDate(0)}
                    className={`px-1.5 py-0.5 rounded font-medium ${
                      searchFilters.date === todayStr ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleQuickDate(1)}
                    className={`px-1.5 py-0.5 rounded font-medium ${
                      searchFilters.date === tomorrowStr ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <input
                  type="date"
                  value={searchFilters.date}
                  min={todayStr}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Search CTA Button */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> Instant Refund Guarantee
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500" /> 24x7 Customer Support
              </span>
            </div>

            <button
              onClick={searchBuses}
              disabled={loadingBuses}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loadingBuses ? 'Searching Buses...' : 'Search Available Buses'}
            </button>
          </div>

        </div>

        {/* Popular Route Fast Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Popular Indian Routes:</span>
          {POPULAR_INDIAN_ROUTES.map((route, i) => (
            <button
              key={i}
              onClick={() => handlePopularRouteClick(route.s, route.d)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              {route.s} → {route.d}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
