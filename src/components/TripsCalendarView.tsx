import React, { useState, useMemo } from 'react';
import { Booking } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Download, 
  ArrowRight, 
  Bus, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface TripsCalendarViewProps {
  bookings: Booking[];
  onSelectTicket: (booking: Booking) => void;
  onOpenLiveTracker: (busId: string) => void;
  onCancelTrip: (bookingId: string) => void;
  cancellingId: string | null;
  formatPrice: (price: number) => string;
}

export const TripsCalendarView: React.FC<TripsCalendarViewProps> = ({
  bookings,
  onSelectTicket,
  onOpenLiveTracker,
  onCancelTrip,
  cancellingId,
  formatPrice
}) => {
  // Determine initial date: either closest upcoming booking date or current date
  const initialDate = useMemo(() => {
    const today = new Date();
    if (bookings.length > 0) {
      // Find the first confirmed trip or earliest trip
      const sorted = [...bookings].sort((a, b) => new Date(a.journeyDate).getTime() - new Date(b.journeyDate).getTime());
      const upcoming = sorted.find(b => b.status === 'confirmed');
      if (upcoming && upcoming.journeyDate) {
        const d = new Date(upcoming.journeyDate);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return today;
  }, [bookings]);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const y = initialDate.getFullYear();
    const m = String(initialDate.getMonth() + 1).padStart(2, '0');
    const d = String(initialDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  // Format Helper
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map trips to dates (normalized format: YYYY-MM-DD)
  const tripsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      if (!b.journeyDate) return;
      // Normalize date string (in case it includes time or varied formats)
      let dateKey = b.journeyDate;
      if (dateKey.includes('T')) {
        dateKey = dateKey.split('T')[0];
      }
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayIndex = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const prevDate = daysInPrevMonth - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateKey = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;
      days.push({
        dayNumber: prevDate,
        dateKey,
        isCurrentMonth: false,
        trips: tripsByDate[dateKey] || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateKey,
        isCurrentMonth: true,
        trips: tripsByDate[dateKey] || []
      });
    }

    // Next month padding to fill grid to multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateKey = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateKey,
        isCurrentMonth: false,
        trips: tripsByDate[dateKey] || []
      });
    }

    return days;
  }, [year, month, tripsByDate]);

  // Trips on the currently selected date
  const selectedDateTrips = useMemo(() => {
    return tripsByDate[selectedDateStr] || [];
  }, [tripsByDate, selectedDateStr]);

  // Format readable selected date string
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return '';
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  // Today key
  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Summary counts for current month
  const monthTripsSummary = useMemo(() => {
    let confirmedCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    bookings.forEach(b => {
      if (!b.journeyDate) return;
      const parts = b.journeyDate.split('-');
      if (parts.length >= 2) {
        const bYear = parseInt(parts[0], 10);
        const bMonth = parseInt(parts[1], 10) - 1;
        if (bYear === year && bMonth === month) {
          if (b.status === 'confirmed') confirmedCount++;
          else if (b.status === 'completed') completedCount++;
          else if (b.status === 'cancelled') cancelledCount++;
        }
      }
    });

    return {
      total: confirmedCount + completedCount + cancelledCount,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount
    };
  }, [bookings, year, month]);

  // Quick jump upcoming trips list
  const upcomingTripChips = useMemo(() => {
    return bookings
      .filter(b => b.status === 'confirmed')
      .sort((a, b) => new Date(a.journeyDate).getTime() - new Date(b.journeyDate).getTime())
      .slice(0, 4);
  }, [bookings]);

  return (
    <div className="space-y-6">
      
      {/* Quick Jump Bar for Upcoming Trips */}
      {upcomingTripChips.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-bold">Quick Jump to Upcoming Trips:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {upcomingTripChips.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  const d = new Date(b.journeyDate);
                  if (!isNaN(d.getTime())) {
                    setCurrentDate(d);
                    setSelectedDateStr(b.journeyDate);
                  }
                }}
                className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all border flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  selectedDateStr === b.journeyDate
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/50'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-emerald-200 dark:border-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                <CalendarIcon className="w-3 h-3 text-emerald-500" />
                <span>{b.journeyDate}</span>
                <span className="opacity-75">({b.source.split(' ')[0]} → {b.destination.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Calendar Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid Container */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          
          {/* Calendar Header Controls */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {monthNames[month]} {year}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {monthTripsSummary.confirmed} upcoming • {monthTripsSummary.total} total this month
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 mt-4 text-center">
              {dayNames.map(day => (
                <div key={day} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 mt-2">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateKey === selectedDateStr;
                const isToday = cell.dateKey === todayKey;
                const hasTrips = cell.trips.length > 0;
                const hasConfirmed = cell.trips.some(t => t.status === 'confirmed');
                const hasCompleted = cell.trips.some(t => t.status === 'completed');

                return (
                  <button
                    key={`${cell.dateKey}-${idx}`}
                    onClick={() => setSelectedDateStr(cell.dateKey)}
                    className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-2xl text-left flex flex-col justify-between transition-all duration-200 relative border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-md scale-[1.02] z-10'
                        : isToday
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-emerald-300 dark:border-emerald-700/60'
                        : cell.isCurrentMonth
                        ? 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        : 'bg-slate-50/40 dark:bg-slate-900/30 border-transparent text-slate-300 dark:text-slate-700 opacity-60'
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black ${
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : isToday
                          ? 'text-emerald-600 dark:text-emerald-400 underline underline-offset-2'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}>
                        {cell.dayNumber}
                      </span>

                      {/* Small badge if today */}
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>

                    {/* Trip Badges in Cell */}
                    <div className="mt-1 space-y-1 w-full overflow-hidden">
                      {cell.trips.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate w-full flex items-center gap-1 ${
                            t.status === 'confirmed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : t.status === 'completed'
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 line-through'
                          }`}
                          title={`${t.busDetails.busName}: ${t.source} to ${t.destination}`}
                        >
                          <Bus className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{t.source.split(' ')[0]}</span>
                        </div>
                      ))}
                      {cell.trips.length > 2 && (
                        <span className="text-[8.5px] font-extrabold text-emerald-600 dark:text-emerald-400 block text-right">
                          +{cell.trips.length - 2} more
                        </span>
                      )}
                    </div>

                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Status Legend */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-emerald-600 inline-block" /> Confirmed Trip
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-slate-400 inline-block" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-rose-400 inline-block" /> Cancelled
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400">
              Click any date to view detailed itinerary
            </p>
          </div>

        </div>

        {/* Selected Date Itinerary Details Panel */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col justify-between space-y-4">
            
            <div>
              {/* Selected Day Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Day Itinerary
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {formattedSelectedDate}
                  </h3>
                </div>

                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl">
                  {selectedDateTrips.length} {selectedDateTrips.length === 1 ? 'Trip' : 'Trips'}
                </span>
              </div>

              {/* Trip Cards for Selected Date */}
              <div className="mt-4 space-y-4 overflow-y-auto max-h-[460px] pr-1">
                {selectedDateTrips.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No trips scheduled for this date
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Pick another date marked with a green indicator on the calendar to see your bus schedule.
                      </p>
                    </div>
                  </div>
                ) : (
                  selectedDateTrips.map(b => (
                    <div
                      key={b.id}
                      className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3.5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-xs"
                    >
                      {/* PNR & Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-md">
                          PNR: {b.pnr}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-600 text-white'
                            : b.status === 'completed'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      {/* Bus details */}
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {b.busDetails.busName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {b.busDetails.operator} • {b.busDetails.busType}
                        </p>
                      </div>

                      {/* Route Timings */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-750 text-xs grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Boarding</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{b.source}</p>
                          <p className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {b.boardingPoint.time}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{b.boardingPoint.name}</p>
                        </div>

                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Dropping</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{b.destination}</p>
                          <p className="text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {b.droppingPoint.time}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{b.droppingPoint.name}</p>
                        </div>
                      </div>

                      {/* Seats & Price */}
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Reserved Seats</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{b.seats.join(', ')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold block">Fare Paid</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatPrice(b.finalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => onSelectTicket(b)}
                          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Ticket PDF
                        </button>

                        {b.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => onOpenLiveTracker(b.busId)}
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                            >
                              <MapPin className="w-3.5 h-3.5 animate-pulse" />
                              Track GPS
                            </button>

                            <button
                              onClick={() => onCancelTrip(b.id)}
                              disabled={cancellingId === b.id}
                              className="py-2 px-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800"
                              title="Cancel Ticket"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>All dates and boarding schedules synchronize automatically.</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
