import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { 
  Ticket, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Download, 
  RefreshCw, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  List
} from 'lucide-react';
import { TicketConfirmationModal } from './TicketConfirmationModal';
import { TripsCalendarView } from './TripsCalendarView';

interface MyBookingsViewProps {
  onOpenLiveTracker: (busId: string) => void;
  onOpenMapsGuide?: (query: string, dest?: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ onOpenLiveTracker, onOpenMapsGuide }) => {
  const { myBookings, cancelBooking, formatPrice } = useBooking();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredBookings = myBookings.filter(b => {
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    if (activeTab === 'completed') return b.status === 'completed';
    return b.status === 'confirmed';
  });

  const handleCancelTrip = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? An 85% instant refund will be credited to your Velox Wallet.')) {
      setCancellingId(bookingId);
      const res = await cancelBooking(bookingId);
      setCancellingId(null);
      if (res.success) {
        alert(`Booking cancelled! Instant refund of ${formatPrice(res.refundAmount || 0)} credited.`);
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header with Title & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="w-7 h-7 text-emerald-600" />
            My Trips & Bookings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View upcoming itineraries, visualize trips on a calendar, download PDF e-tickets, and track your buses live.
          </p>
        </div>

        {/* View Mode Toggle: List vs Calendar */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl self-start sm:self-auto border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl max-w-md">
        {[
          { id: 'upcoming', label: 'Upcoming Trips' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content: Calendar View vs List View */}
      {viewMode === 'calendar' ? (
        <TripsCalendarView
          bookings={filteredBookings}
          onSelectTicket={(b) => setSelectedTicket(b)}
          onOpenLiveTracker={onOpenLiveTracker}
          onCancelTrip={handleCancelTrip}
          cancellingId={cancellingId}
          formatPrice={formatPrice}
        />
      ) : (
        /* List View */
        filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No {activeTab} bookings found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You don't have any trips listed under this tab. Book a new bus ticket to start traveling!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(b => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-md uppercase">
                      PNR: {b.pnr}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">{b.busDetails.busName}</h3>
                    <p className="text-xs text-slate-500">{b.busDetails.operator} • {b.busDetails.busType}</p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {b.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Booking ID: {b.id}</p>
                  </div>
                </div>

                {/* Journey Route Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">From (Boarding)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{b.source}</p>
                    <p className="text-emerald-600 font-bold">{b.boardingPoint.time} ({b.journeyDate})</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">To (Dropping)</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{b.destination}</p>
                    <p className="text-rose-500 font-bold">{b.droppingPoint.time}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Seats & Fare</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Seats: {b.seats.join(', ')}</p>
                    <p className="text-emerald-600 font-black">{formatPrice(b.finalAmount)}</p>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTicket(b)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      View & Download Ticket
                    </button>
                    {onOpenMapsGuide && (
                      <button
                        onClick={() => onOpenMapsGuide(b.boardingPoint.location + ', ' + b.source, b.destination)}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                        title="Explore Boarding Station Amenities & Google Maps links"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Station Guide
                      </button>
                    )}
                  </div>

                  {b.status === 'confirmed' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenLiveTracker(b.busId)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 animate-pulse" />
                        Track Live GPS
                      </button>

                      <button
                        onClick={() => handleCancelTrip(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors border border-rose-200 dark:border-rose-800"
                      >
                        Cancel Trip
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketConfirmationModal
          booking={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onOpenTracker={(busId) => {
            setSelectedTicket(null);
            onOpenLiveTracker(busId);
          }}
        />
      )}

    </div>
  );
};

