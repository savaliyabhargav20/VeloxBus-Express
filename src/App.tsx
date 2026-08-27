import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { BusFilterSidebar } from './components/BusFilterSidebar';
import { BusCard } from './components/BusCard';
import { SeatMapModal } from './components/SeatMapModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TicketConfirmationModal } from './components/TicketConfirmationModal';
import { MyBookingsView } from './components/MyBookingsView';
import { LiveTrackerModal } from './components/LiveTrackerModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SupportChatWidget } from './components/SupportChatWidget';
import { OffersModal } from './components/OffersModal';
import { AuthModal } from './components/AuthModal';
import { MapsGroundingModal } from './components/MapsGroundingModal';
import { RouteMapD3 } from './components/RouteMapD3';
import { Footer } from './components/Footer';
import { Bus, Booking } from './types';
import { Bus as BusIcon, Filter, RefreshCw, AlertCircle, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';

function MainApp() {
  const { searchResults, loadingBuses, searchFilters, clearSeatSelection } = useBooking();

  const [activeTab, setActiveTab] = useState<'search' | 'bookings' | 'offers' | 'admin' | 'profile'>('search');
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeBusForSeats, setActiveBusForSeats] = useState<Bus | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState<Booking | null>(null);
  const [liveTrackBusId, setLiveTrackBusId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(true);
  const [focusedBusForMap, setFocusedBusForMap] = useState<Bus | null>(null);

  // Maps Grounding modal state
  const [mapsModalOpen, setMapsModalOpen] = useState(false);
  const [mapsQuery, setMapsQuery] = useState<string>('Majestic Kempegowda Terminal, Bengaluru');
  const [mapsDestination, setMapsDestination] = useState<string>('');

  const handleOpenMapsGuide = (query?: string, dest?: string) => {
    if (query) setMapsQuery(query);
    if (dest) setMapsDestination(dest);
    setMapsModalOpen(true);
  };

  const handleOpenSeatMap = (bus: Bus) => {
    setActiveBusForSeats(bus);
  };

  const handleCloseSeatMap = () => {
    setActiveBusForSeats(null);
  };

  const handleProceedToCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setCheckoutModalOpen(false);
    setActiveBusForSeats(null);
    clearSeatSelection();
    setActiveConfirmedBooking(booking);
    setActiveTab('bookings');
  };

  const handleOpenLiveTracker = (busId: string = 'bus-101') => {
    setLiveTrackBusId(busId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenLiveTracker={() => handleOpenLiveTracker('bus-101')}
        onOpenMapsGuide={() => handleOpenMapsGuide(`${searchFilters.source} Bus Station`, searchFilters.destination)}
      />

      {/* App Body Content Based on Active Tab */}
      <main className="flex-1">
        
        {/* TAB 1: SEARCH & BOOK BUS TICKETS */}
        {activeTab === 'search' && (
          <div>
            <HeroSearch />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <BusIcon className="w-5 h-5 text-emerald-600" />
                    Available Buses ({searchResults.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Route: <strong className="text-slate-700 dark:text-slate-300">{searchFilters.source}</strong> to <strong className="text-slate-700 dark:text-slate-300">{searchFilters.destination}</strong> on {searchFilters.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRouteMap(!showRouteMap)}
                    className={`px-3 py-2 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showRouteMap 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>{showRouteMap ? 'Hide Route Map' : 'Show Route Map (D3)'}</span>
                    {showRouteMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={() => handleOpenMapsGuide(`${searchFilters.source} Central Bus Stand`, searchFilters.destination)}
                    className="hidden sm:flex px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <span>📍 Terminal Guide</span>
                  </button>

                  <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="lg:hidden px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Filter className="w-4 h-4 text-emerald-600" />
                    Filter Options
                  </button>
                </div>
              </div>

              {/* D3 Route Visualization Map Card */}
              {showRouteMap && (
                <div className="mb-8">
                  <RouteMapD3
                    source={searchFilters.source}
                    destination={searchFilters.destination}
                    selectedBus={focusedBusForMap || activeBusForSeats}
                    onOpenMapsGuide={handleOpenMapsGuide}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Desktop Filter Sidebar */}
                <div className={`lg:col-span-3 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                  <BusFilterSidebar />
                </div>

                {/* Bus Results List */}
                <div className="lg:col-span-9 space-y-4">
                  {loadingBuses ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Searching express buses on this route...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                      <h3 className="text-base font-bold">No buses found matching your search parameters</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Try clearing or adjusting price range, bus type filters, or search for popular routes like 'Visakhapatnam to Vijayawada'.
                      </p>
                    </div>
                  ) : (
                    searchResults.map(bus => (
                      <BusCard
                        key={bus.id}
                        bus={bus}
                        onSelectSeats={handleOpenSeatMap}
                        onViewRouteMap={(b) => {
                          setFocusedBusForMap(b);
                          setShowRouteMap(true);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                      />
                    ))
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <MyBookingsView 
            onOpenLiveTracker={handleOpenLiveTracker} 
            onOpenMapsGuide={handleOpenMapsGuide}
          />
        )}

        {/* TAB 3: SPECIAL OFFERS */}
        {activeTab === 'offers' && (
          <OffersModal />
        )}

        {/* TAB 4: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {/* TAB 5: USER PROFILE */}
        {activeTab === 'profile' && (
          <UserProfileModal />
        )}

      </main>

      {/* Floating 24x7 Customer Support AI Chat Widget */}
      <SupportChatWidget />

      {/* Footer */}
      <Footer />

      {/* MODALS */}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Interactive Seat Selection Modal */}
      <SeatMapModal
        bus={activeBusForSeats}
        isOpen={!!activeBusForSeats && !checkoutModalOpen}
        onClose={handleCloseSeatMap}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Passenger & Payment Checkout Modal */}
      <CheckoutModal
        bus={activeBusForSeats}
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Post-Booking Ticket Confirmation Modal */}
      <TicketConfirmationModal
        booking={activeConfirmedBooking}
        isOpen={!!activeConfirmedBooking}
        onClose={() => setActiveConfirmedBooking(null)}
        onOpenTracker={handleOpenLiveTracker}
        onGoToUpcomingTrips={() => setActiveTab('bookings')}
      />

      {/* Live GPS Tracker Modal */}
      <LiveTrackerModal
        busId={liveTrackBusId}
        isOpen={!!liveTrackBusId}
        onClose={() => setLiveTrackBusId(null)}
        onOpenMapsGuide={handleOpenMapsGuide}
      />

      {/* Google Maps Grounded Terminal & Area Guide Modal */}
      <MapsGroundingModal
        isOpen={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
        initialQuery={mapsQuery}
        initialDestination={mapsDestination}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainApp />
      </BookingProvider>
    </AuthProvider>
  );
}
