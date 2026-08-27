import React, { useState, useEffect } from 'react';
import { X, Navigation, Phone, ShieldCheck, Clock, RefreshCw, Radio, Share2 } from 'lucide-react';
import { LiveLocationData } from '../types';

interface LiveTrackerModalProps {
  busId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMapsGuide?: (query: string) => void;
}

export const LiveTrackerModal: React.FC<LiveTrackerModalProps> = ({
  busId,
  isOpen,
  onClose,
  onOpenMapsGuide
}) => {
  const [data, setData] = useState<LiveLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchLiveLocation = async () => {
    if (!busId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/buses/${busId}/live-location`);
      const result = await res.json();
      if (result.success) {
        setData(result.liveLocation);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to load GPS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && busId) {
      fetchLiveLocation();
      const interval = setInterval(fetchLiveLocation, 10000); // refresh every 10 sec
      return () => clearInterval(interval);
    }
  }, [isOpen, busId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold">{data?.busName || 'Live Bus GPS Tracker'}</h2>
                <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs text-slate-400">Refreshed at: {lastRefreshed || 'Just now'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {loading && !data ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
              <p className="text-xs font-semibold">Connecting to Bus Onboard GPS Satellite Telematics...</p>
            </div>
          ) : data ? (
            <>
              {/* Telematics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Current Speed</p>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{data.speedKmH} km/h</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Next Stop</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{data.nextStop}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-emerald-600 font-semibold">{data.etaNextStop}</span>
                    {onOpenMapsGuide && (
                      <button
                        type="button"
                        onClick={() => onOpenMapsGuide(data.nextStop)}
                        className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                      >
                        Explore Maps
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Schedule Status</p>
                  <p className={`text-xs font-bold ${data.delayMinutes > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {data.delayMinutes > 0 ? `${data.delayMinutes} mins delay` : 'On Time ✓'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Arrival</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{data.finalEta}</p>
                </div>
              </div>

              {/* Interactive Route Vector Canvas */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative text-white space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Navigation className="w-4 h-4" /> Current Location: {data.currentLocation.placeName}
                  </span>
                  <span>Trip Progress: {data.progressPercent}%</span>
                </div>

                {/* Vector Progress Bar */}
                <div className="relative py-6">
                  {/* Base Track */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${data.progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Pulsing Bus Marker */}
                  <div
                    className="absolute top-2 transition-all duration-500 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${data.progressPercent}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white animate-bounce">
                      🚍
                    </div>
                  </div>
                </div>

                {/* Checkpoint Nodes List */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[10px] text-slate-400">
                  {data.routeCoordinates.map((point, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto mb-1"></div>
                      <span className="block font-semibold truncate text-slate-300">{point.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver & Support Contacts */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Verified Velox Captain & Crew Onboard</p>
                    <p className="text-[11px] text-slate-500">Equipped with automatic speed governor & emergency panic button.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:+15559990000"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Captain
                  </a>
                  <button
                    onClick={fetchLiveLocation}
                    className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 transition-colors"
                    title="Refresh GPS Signal"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : null}

        </div>

      </div>
    </div>
  );
};
