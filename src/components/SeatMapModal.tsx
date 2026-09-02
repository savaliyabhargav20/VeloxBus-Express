import React, { useState } from 'react';
import { Bus, Seat, BoardingPoint, DroppingPoint } from '../types';
import { X, Check, Info, Shield, MapPin, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

interface SeatMapModalProps {
  bus: Bus | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const SeatMapModal: React.FC<SeatMapModalProps> = ({
  bus,
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const {
    selectedSeats,
    toggleSeatSelection,
    boardingPoint,
    setBoardingPoint,
    droppingPoint,
    setDroppingPoint,
    formatPrice
  } = useBooking();

  const isSleeper = bus?.busType?.toLowerCase().includes('sleeper') ?? false;
  const [deckView, setDeckView] = useState<'both' | 'lower' | 'upper'>('both');

  if (!isOpen || !bus) return null;

  const lowerSeats = bus.seatLayout.filter(s => s.deck === 'lower' || !s.deck);
  const upperSeats = bus.seatLayout.filter(s => s.deck === 'upper');
  const hasUpperDeck = upperSeats.length > 0 || isSleeper;

  const unitPrice = bus.discountPrice || bus.price;
  const totalAmount = selectedSeats.length * unitPrice;

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }
    if (!boardingPoint) {
      setBoardingPoint(bus.boardingPoints[0]);
    }
    if (!droppingPoint) {
      setDroppingPoint(bus.droppingPoints[0]);
    }
    onProceedToCheckout();
  };

  // Helper to render a deck cabin panel
  const renderDeckCabin = (deckName: string, seats: Seat[], isLower: boolean) => {
    // Separate into left column (single berth/seat) and right column (double berth/seater)
    const leftColumnSeats = seats.filter((_, idx) => idx % 2 === 0);
    const rightColumnSeats = seats.filter((_, idx) => idx % 2 !== 0);

    return (
      <div className="flex-1 bg-slate-100 dark:bg-slate-800/90 p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700/80 relative flex flex-col justify-between">
        
        {/* Deck Header & Driver Cabin Indicator */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLower ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
              {deckName}
            </span>
            {isLower ? (
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Driver Cabin
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-500 dark:text-slate-400">
                Upper Tier
              </div>
            )}
          </div>

          {/* Seats / Berths Layout Grid with Gangway */}
          <div className="grid grid-cols-12 gap-2 items-start">
            
            {/* Left Column Berths */}
            <div className="col-span-5 space-y-2">
              <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 text-center mb-1">
                Single Berth
              </p>
              {leftColumnSeats.map(seat => {
                const isSelected = selectedSeats.includes(seat.id);
                const isBooked = seat.status === 'booked';
                const isWomen = seat.status === 'women_only';

                return (
                  <button
                    key={seat.id}
                    disabled={isBooked}
                    onClick={() => toggleSeatSelection(seat.id)}
                    className={`w-full relative transition-all duration-200 ease-out transform rounded-xl p-1.5 font-bold text-xs flex flex-col items-center justify-center cursor-pointer border ${
                      isSleeper ? 'h-13' : 'h-10'
                    } ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.03] ring-2 ring-emerald-400/50'
                        : isBooked
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                        : isWomen
                        ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-800 hover:bg-pink-100 hover:scale-[1.02] active:scale-95'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <span className="text-[11px] font-black">{seat.number}</span>
                    <span className="text-[8.5px] font-semibold opacity-80">{formatPrice(seat.price)}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 absolute top-1 right-1 transition-all duration-200 animate-in zoom-in-50 fade-in text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Central Gangway / Aisle Walkway */}
            <div className="col-span-2 flex flex-col items-center justify-center h-full min-h-[220px] border-x border-dashed border-slate-300 dark:border-slate-700 text-[8px] font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase">
              <span className="[writing-mode:vertical-lr] rotate-180 select-none py-4">
                Aisle Gangway
              </span>
            </div>

            {/* Right Column Berths */}
            <div className="col-span-5 space-y-2">
              <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 text-center mb-1">
                Double Berth
              </p>
              {rightColumnSeats.map(seat => {
                const isSelected = selectedSeats.includes(seat.id);
                const isBooked = seat.status === 'booked';
                const isWomen = seat.status === 'women_only';

                return (
                  <button
                    key={seat.id}
                    disabled={isBooked}
                    onClick={() => toggleSeatSelection(seat.id)}
                    className={`w-full relative transition-all duration-200 ease-out transform rounded-xl p-1.5 font-bold text-xs flex flex-col items-center justify-center cursor-pointer border ${
                      isSleeper ? 'h-13' : 'h-10'
                    } ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.03] ring-2 ring-emerald-400/50'
                        : isBooked
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                        : isWomen
                        ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-800 hover:bg-pink-100 hover:scale-[1.02] active:scale-95'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <span className="text-[11px] font-black">{seat.number}</span>
                    <span className="text-[8.5px] font-semibold opacity-80">{formatPrice(seat.price)}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 absolute top-1 right-1 transition-all duration-200 animate-in zoom-in-50 fade-in text-white" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Rear Exit Indicator */}
        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-center text-[9px] text-slate-400 uppercase tracking-widest font-bold">
          Rear Exit Door
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">{bus.name}</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {bus.busType}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {bus.source} → {bus.destination} ({bus.departureTime} departure)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Seat & Berth Cabin Decks */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Legend Bar */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-pink-100 dark:bg-pink-950 border border-pink-400 text-pink-600"></div>
                <span>Women Only</span>
              </div>
            </div>

            {/* Deck Switcher / Alignment View Tabs for Sleeper */}
            {hasUpperDeck && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  onClick={() => setDeckView('both')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    deckView === 'both'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Both Decks (Side-by-Side Aligned)
                </button>
                <button
                  onClick={() => setDeckView('lower')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    deckView === 'lower'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Lower Deck Only
                </button>
                <button
                  onClick={() => setDeckView('upper')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    deckView === 'upper'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Upper Deck Only
                </button>
              </div>
            )}

            {/* Aligned Bus Cabin Panels */}
            {hasUpperDeck ? (
              <div className={`grid gap-4 ${deckView === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {(deckView === 'both' || deckView === 'lower') && renderDeckCabin('Lower Deck', lowerSeats, true)}
                {(deckView === 'both' || deckView === 'upper') && renderDeckCabin('Upper Deck', upperSeats, false)}
              </div>
            ) : (
              renderDeckCabin('Passenger Cabin', lowerSeats, true)
            )}

          </div>

          {/* Right Column: Points Selection & Summary */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Selected Seats Badge */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Selected Seats ({selectedSeats.length})</span>
                  {selectedSeats.length > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                      Live selection
                    </span>
                  )}
                </p>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 transition-all duration-300">
                    {selectedSeats.map(s => (
                      <span
                        key={s}
                        className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-xs transition-all duration-200 transform animate-in zoom-in-75 fade-in hover:scale-105"
                      >
                        Seat {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic transition-all duration-200 animate-in fade-in">
                    No seats selected yet. Click on available seats in the map.
                  </p>
                )}
              </div>

              {/* Boarding Point Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Boarding Point (Departure)
                </label>
                <select
                  value={boardingPoint?.id || bus.boardingPoints[0]?.id}
                  onChange={(e) => {
                    const bp = bus.boardingPoints.find(p => p.id === e.target.value);
                    if (bp) setBoardingPoint(bp);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  {bus.boardingPoints.map(bp => (
                    <option key={bp.id} value={bp.id}>
                      {bp.time} - {bp.name} ({bp.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropping Point Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dropping Point (Arrival)
                </label>
                <select
                  value={droppingPoint?.id || bus.droppingPoints[0]?.id}
                  onChange={(e) => {
                    const dp = bus.droppingPoints.find(p => p.id === e.target.value);
                    if (dp) setDroppingPoint(dp);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                >
                  {bus.droppingPoints.map(dp => (
                    <option key={dp.id} value={dp.id}>
                      {dp.time} - {dp.name} ({dp.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Base Fare ({selectedSeats.length} × {formatPrice(unitPrice)})</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>GST & Service Charge</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Included</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-baseline font-black text-slate-800 dark:text-slate-100">
                  <span className="text-sm">Total Amount:</span>
                  <span className="text-xl text-emerald-600 dark:text-emerald-400">{formatPrice(totalAmount)}</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={onClose}
                className="w-1/3 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Passenger Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
