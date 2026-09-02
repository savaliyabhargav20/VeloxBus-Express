import React, { useState } from 'react';
import { Bus, User as UserIcon, LogOut, ShieldCheck, Ticket, MapPin, Tag, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

interface HeaderProps {
  activeTab: 'search' | 'bookings' | 'offers' | 'admin' | 'profile';
  setActiveTab: (tab: 'search' | 'bookings' | 'offers' | 'admin' | 'profile') => void;
  onOpenAuth: () => void;
  onOpenLiveTracker: () => void;
  onOpenMapsGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenLiveTracker,
  onOpenMapsGuide
}) => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { myBookings } = useBooking();
  const [userDropdown, setUserDropdown] = useState(false);

  const upcomingCount = myBookings.filter(b => b.status === 'confirmed').length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                VeloxBus
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bus className="w-4 h-4" />
              Book Tickets
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                activeTab === 'bookings'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Bookings
              {upcomingCount > 0 && (
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {upcomingCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenLiveTracker}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-emerald-500 animate-pulse" />
              Live Bus Track
            </button>

            {onOpenMapsGuide && (
              <button
                onClick={onOpenMapsGuide}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Station & Maps Guide</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('offers')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'offers'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Tag className="w-4 h-4 text-amber-500" />
              Offers
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">

            {/* User Auth Section */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {userDropdown && (
                  <div 
                    onMouseLeave={() => setUserDropdown(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Velox Wallet:</span>
                        <span className="font-bold">₹{user.walletBalance.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setActiveTab('profile'); setUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      Manage Profile & Saved Passengers
                    </button>

                    <button
                      onClick={() => { setActiveTab('bookings'); setUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      My Booking History
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { setActiveTab('admin'); setUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => { logout(); setUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-emerald-500/20"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
