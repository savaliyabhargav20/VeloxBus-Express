import React, { useState } from 'react';
import { Bus } from '../types';
import { Star, Wifi, Zap, Droplet, Shield, Clock, MapPin, ChevronDown, ChevronUp, Users, ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

interface BusCardProps {
  bus: Bus;
  onSelectSeats: (bus: Bus) => void;
  onViewRouteMap?: (bus: Bus) => void;
}

export const BusCard: React.FC<BusCardProps> = ({ bus, onSelectSeats, onViewRouteMap }) => {
  const { formatPrice } = useBooking();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Top Banner if Electric or Special Offer */}
      {bus.isElectric && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-4 py-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
            100% Zero Emission Electric Coach - Quiet & Smooth Journey
          </span>
          <span>Save 10% Extra</span>
        </div>
      )}

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Operator & Bus Info */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{bus.name}</h3>
              {bus.gpsEnabled && (
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live GPS
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{bus.operator}</p>
            
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                {bus.busType}
              </span>
              
              {/* Rating badge */}
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{bus.rating}</span>
                <span className="text-slate-400 font-normal">({bus.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Timings & Route Duration */}
          <div className="md:col-span-5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{bus.departureTime}</p>
              <p className="text-[11px] font-bold text-slate-500 truncate max-w-[100px]">{bus.source}</p>
            </div>

            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {bus.duration}
              </span>
              <div className="w-20 h-0.5 bg-slate-300 dark:bg-slate-700 relative my-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.75 left-0"></div>
                <div className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.75 right-0"></div>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Direct Route</span>
            </div>

            <div className="text-right">
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{bus.arrivalTime}</p>
              <p className="text-[11px] font-bold text-slate-500 truncate max-w-[100px]">{bus.destination}</p>
            </div>
          </div>

          {/* Fare & Select Seats CTA */}
          <div className="md:col-span-3 text-right flex md:flex-col justify-between items-center md:items-end">
            <div>
              <div className="flex items-baseline justify-end gap-1.5">
                {bus.discountPrice && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {formatPrice(bus.price)}
                  </span>
                )}
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatPrice(bus.discountPrice || bus.price)}
                </span>
              </div>
              
              <p className="text-[10px] text-slate-400 font-medium">Per seat incl. taxes</p>
            </div>

            <div className="mt-2 text-right">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {bus.availableSeatsCount} seats left
              </p>

              <button
                onClick={() => onSelectSeats(bus)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Select Seats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Collapsible Details Button */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Wifi className="w-3 h-3 text-emerald-500" /> Free Wi-Fi
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Zap className="w-3 h-3 text-amber-500" /> Charging Port
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Droplet className="w-3 h-3 text-blue-500" /> Water Bottle
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onViewRouteMap && (
              <button
                type="button"
                onClick={() => onViewRouteMap(bus)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                title="Inspect route trajectory, stops & elevation profile on D3 map"
              >
                <MapPin className="w-3 h-3" />
                <span>View Route Map</span>
              </button>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              {showDetails ? 'Hide Boarding & Policy' : 'Boarding Points & Policy'}
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Boarding Points & Cancellation Policy */}
        {showDetails && (
          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Boarding Points:
                </p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  {bus.boardingPoints.map(bp => (
                    <li key={bp.id} className="flex justify-between border-b border-slate-200/50 dark:border-slate-700/50 py-0.5">
                      <span>{bp.name} ({bp.location})</span>
                      <span className="font-bold text-emerald-600">{bp.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Dropping Points:
                </p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  {bus.droppingPoints.map(dp => (
                    <li key={dp.id} className="flex justify-between border-b border-slate-200/50 dark:border-slate-700/50 py-0.5">
                      <span>{dp.name} ({dp.location})</span>
                      <span className="font-bold text-rose-500">{dp.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span><strong className="text-slate-700 dark:text-slate-300">Cancellation Policy:</strong> {bus.cancellationPolicy}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
