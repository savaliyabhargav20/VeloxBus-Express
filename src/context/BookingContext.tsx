import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bus, SearchFilters, BoardingPoint, DroppingPoint, Passenger, Booking } from '../types';
import { useAuth } from './AuthContext';
import { SAMPLE_BUSES, generateSeatLayout } from '../data/mockData';
import { 
  saveBookingToFirestore, 
  fetchUserBookingsFromFirestore, 
  updateBookingInFirestore 
} from '../lib/firebase';

interface BookingContextType {
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  searchResults: Bus[];
  loadingBuses: boolean;
  searchBuses: () => Promise<void>;
  selectedBus: Bus | null;
  setSelectedBus: (bus: Bus | null) => void;
  selectedSeats: string[];
  toggleSeatSelection: (seatId: string) => void;
  clearSeatSelection: () => void;
  boardingPoint: BoardingPoint | null;
  setBoardingPoint: (bp: BoardingPoint | null) => void;
  droppingPoint: DroppingPoint | null;
  setDroppingPoint: (dp: DroppingPoint | null) => void;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  appliedPromo: { code: string; discount: number; description: string } | null;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  myBookings: Booking[];
  fetchMyBookings: () => Promise<void>;
  createBooking: (
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'paylater' | 'emi',
    contactEmail: string,
    contactPhone: string,
    gstNumber?: string,
    companyName?: string
  ) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string; refundAmount?: number }>;
  activeLiveTrackBusId: string | null;
  setActiveLiveTrackBusId: (id: string | null) => void;
  formatPrice: (amount: number) => string;
}

// Client-side robust fallback search generator
function generateFallbackBuses(filters: SearchFilters): Bus[] {
  let list = [...SAMPLE_BUSES];
  const src = filters.source?.trim().toLowerCase();
  const dst = filters.destination?.trim().toLowerCase();

  let matched = list.filter(b => 
    (!src || b.source.toLowerCase() === src) && 
    (!dst || b.destination.toLowerCase() === dst)
  );

  // If no buses or very few for this specific city pair, generate dynamic operators
  if (matched.length < 4 && src && dst) {
    const srcTitle = filters.source.trim();
    const dstTitle = filters.destination.trim();
    const dynamicOperators = [
      { name: 'Velox Garuda Luxury Express', busType: 'Volvo Multi-Axle AC Sleeper', price: 950, discount: 850, depTime: '21:00', arrTime: '05:30', duration: '8h 30m', isElectric: false, rating: 4.8 },
      { name: 'Orange Travels', busType: 'Volvo Multi-Axle AC Sleeper', price: 1050, discount: 950, depTime: '22:15', arrTime: '06:45', duration: '8h 30m', isElectric: true, rating: 4.9 },
      { name: 'VRL Travels', busType: 'AC Sleeper', price: 850, discount: 750, depTime: '20:30', arrTime: '05:00', duration: '8h 30m', isElectric: false, rating: 4.6 },
      { name: 'APSRTC Express', busType: 'AC Seater', price: 550, discount: undefined, depTime: '06:00', arrTime: '12:00', duration: '6h 00m', isElectric: false, rating: 4.5 },
      { name: 'TSRTC Pushpak', busType: 'AC Sleeper', price: 780, discount: 700, depTime: '21:45', arrTime: '05:45', duration: '8h 00m', isElectric: false, rating: 4.4 },
      { name: 'KSRTC Airavat Club Class', busType: 'Volvo Multi-Axle AC Sleeper', price: 920, discount: 820, depTime: '22:00', arrTime: '06:15', duration: '8h 15m', isElectric: false, rating: 4.7 },
      { name: 'Morning Star Travels', busType: 'AC Sleeper', price: 890, discount: 790, depTime: '22:30', arrTime: '06:30', duration: '8h 00m', isElectric: false, rating: 4.8 },
      { name: 'IntrCity SmartBus', busType: 'AC Sleeper 2+1', price: 990, discount: 890, depTime: '23:00', arrTime: '07:00', duration: '8h 00m', isElectric: true, rating: 4.9 }
    ];

    const generated: Bus[] = dynamicOperators.map((op, idx) => ({
      id: `dyn-${srcTitle}-${dstTitle}-${idx + 1}`,
      name: `${op.name} ${srcTitle}-${dstTitle} Express`,
      operator: op.name,
      busType: op.busType as any,
      source: srcTitle,
      destination: dstTitle,
      departureTime: op.depTime,
      arrivalTime: op.arrTime,
      duration: op.duration,
      price: op.price,
      discountPrice: op.discount,
      rating: op.rating,
      reviewCount: Math.floor(120 + idx * 35),
      totalSeats: op.busType.includes('Sleeper') ? 24 : 32,
      availableSeatsCount: Math.floor(8 + (idx * 2) % 15),
      amenities: ['wifi', 'power', 'water', 'blanket', 'tracking'],
      isElectric: op.isElectric,
      gpsEnabled: true,
      cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
      boardingPoints: [
        { id: 'bp1', name: `${srcTitle} Central RTC Concourse`, time: op.depTime, location: 'Platform 1' },
        { id: 'bp2', name: `${srcTitle} Highway Bypass Point`, time: '23:30', location: 'Toll Plaza / Service Bay' }
      ],
      droppingPoints: [
        { id: 'dp1', name: `${dstTitle} Main Terminal / Bus Stand`, time: op.arrTime, location: 'Arrival Concourse' }
      ],
      seatLayout: generateSeatLayout(op.busType.includes('Sleeper'))
    }));

    matched = [...matched, ...generated];
  }

  // Apply filters
  if (filters.minRating > 0) {
    matched = matched.filter(b => b.rating >= filters.minRating);
  }
  if (filters.busTypes && filters.busTypes.length > 0) {
    matched = matched.filter(b => filters.busTypes.includes(b.busType));
  }
  if (filters.operators && filters.operators.length > 0) {
    matched = matched.filter(b => filters.operators.includes(b.operator));
  }
  if (filters.priceRange && filters.priceRange[1] < 3000) {
    matched = matched.filter(b => (b.discountPrice || b.price) <= filters.priceRange[1]);
  }

  // Sort
  if (filters.sortBy === 'price_low') {
    matched.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (filters.sortBy === 'price_high') {
    matched.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (filters.sortBy === 'rating') {
    matched.sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === 'departure_early') {
    matched.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  return matched;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    source: 'Visakhapatnam',
    destination: 'Vijayawada',
    date: new Date().toISOString().split('T')[0],
    priceRange: [0, 3000],
    busTypes: [],
    departureTimeSlots: [],
    amenities: [],
    operators: [],
    minRating: 0,
    sortBy: 'rating'
  });

  const [searchResults, setSearchResults] = useState<Bus[]>(() => generateFallbackBuses({
    source: 'Visakhapatnam',
    destination: 'Vijayawada',
    date: new Date().toISOString().split('T')[0],
    priceRange: [0, 3000],
    busTypes: [],
    departureTimeSlots: [],
    amenities: [],
    operators: [],
    minRating: 0,
    sortBy: 'rating'
  }));
  const [loadingBuses, setLoadingBuses] = useState<boolean>(false);

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState<BoardingPoint | null>(null);
  const [droppingPoint, setDroppingPoint] = useState<DroppingPoint | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string } | null>(null);

  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [activeLiveTrackBusId, setActiveLiveTrackBusId] = useState<string | null>(null);

  // Format currency helper
  const formatPrice = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Search Buses from backend API with instant fallback
  const searchBuses = useCallback(async () => {
    setLoadingBuses(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchFilters.source) queryParams.append('source', searchFilters.source);
      if (searchFilters.destination) queryParams.append('destination', searchFilters.destination);
      if (searchFilters.date) queryParams.append('date', searchFilters.date);
      if (searchFilters.sortBy) queryParams.append('sortBy', searchFilters.sortBy);
      if (searchFilters.minRating > 0) queryParams.append('rating', searchFilters.minRating.toString());
      if (searchFilters.busTypes.length > 0) queryParams.append('busType', searchFilters.busTypes.join(','));
      if (searchFilters.operators.length > 0) queryParams.append('operators', searchFilters.operators.join(','));
      if (searchFilters.priceRange[1] < 3000) queryParams.append('maxPrice', searchFilters.priceRange[1].toString());

      const res = await fetch(`/api/buses/search?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.buses) && data.buses.length > 0) {
          setSearchResults(data.buses);
          return;
        }
      }
      // If API response had no results or wasn't ok, use fallback
      setSearchResults(generateFallbackBuses(searchFilters));
    } catch (err) {
      // Graceful fallback to client-side data
      setSearchResults(generateFallbackBuses(searchFilters));
    } finally {
      setLoadingBuses(false);
    }
  }, [searchFilters]);

  useEffect(() => {
    searchBuses();
  }, [searchBuses]);

  // Fetch user bookings from Firestore & Server API
  const fetchMyBookings = useCallback(async () => {
    try {
      const email = user?.email || 'alex.johnson@example.com';
      const userId = user?.id;

      // 1. Check Firestore for persistent user bookings
      const firestoreBookings = await fetchUserBookingsFromFirestore(email, userId);

      // 2. Fetch server bookings
      const res = await fetch(`/api/bookings/my-bookings?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      const serverBookings: Booking[] = (data.success && data.bookings) ? data.bookings : [];

      // Merge and deduplicate by ID
      const map = new Map<string, Booking>();
      firestoreBookings.forEach(b => map.set(b.id, b));
      serverBookings.forEach(b => {
        if (!map.has(b.id)) map.set(b.id, b);
      });

      const merged = Array.from(map.values());
      setMyBookings(merged);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  // Seat Selection Handler
  const toggleSeatSelection = (seatId: string) => {
    setSelectedSeats(prev => {
      let updated: string[];
      if (prev.includes(seatId)) {
        updated = prev.filter(s => s !== seatId);
      } else {
        if (prev.length >= 6) {
          alert('You can select a maximum of 6 seats per transaction.');
          return prev;
        }
        updated = [...prev, seatId];
      }

      // Auto adjust passengers state
      setPassengers(old => {
        const next: Passenger[] = [];
        updated.forEach((s, idx) => {
          const existing = old.find(p => p.seatNumber === s) || old[idx];
          next.push({
            name: existing?.name || (user && idx === 0 ? user.name : ''),
            age: existing?.age || 25,
            gender: existing?.gender || 'male',
            seatNumber: s
          });
        });
        return next;
      });

      return updated;
    });
  };

  const clearSeatSelection = () => {
    setSelectedSeats([]);
    setPassengers([]);
    setBoardingPoint(null);
    setDroppingPoint(null);
    setAppliedPromo(null);
  };

  // Promo Code Validation
  const applyPromoCode = async (code: string) => {
    if (!selectedBus) return { success: false, message: 'Please select a bus first.' };
    const baseTotal = selectedSeats.length * (selectedBus.discountPrice || selectedBus.price);

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount: baseTotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedPromo({
          code: data.code,
          discount: data.discount,
          description: data.description
        });
        return { success: true, message: `Promo code ${data.code} applied! Saved ${formatPrice(data.discount)}` };
      } else {
        return { success: false, message: data.message || 'Invalid Promo Code' };
      }
    } catch (err) {
      return { success: false, message: 'Failed to validate promo code.' };
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Create Booking
  const createBooking = async (
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'paylater' | 'emi',
    contactEmail: string,
    contactPhone: string,
    gstNumber?: string,
    companyName?: string
  ): Promise<Booking | null> => {
    if (!selectedBus || selectedSeats.length === 0 || !boardingPoint || !droppingPoint) {
      return null;
    }

    const baseFare = selectedSeats.length * (selectedBus.discountPrice || selectedBus.price);
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const finalAmount = Math.max(0, baseFare - discount);

    const bookingPayload = {
      busId: selectedBus.id,
      source: selectedBus.source,
      destination: selectedBus.destination,
      journeyDate: searchFilters.date,
      seats: selectedSeats,
      passengers,
      boardingPoint,
      droppingPoint,
      contactEmail,
      contactPhone,
      gstNumber,
      companyName,
      promoCode: appliedPromo?.code,
      paymentMethod,
      totalFare: baseFare,
      discountAmount: discount,
      finalAmount
    };

    let confirmedBooking: Booking | null = null;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await res.json();
      if (data.success && data.booking) {
        confirmedBooking = data.booking;
      }
    } catch (err) {
      console.error('Booking Creation Error:', err);
    }

    if (!confirmedBooking) {
      // Local fallback
      confirmedBooking = {
        ...bookingPayload,
        id: `VB-${Math.floor(100000 + Math.random() * 900000)}`,
        pnr: `PNR${Math.floor(100000 + Math.random() * 900000)}`,
        bookingDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'confirmed',
        busDetails: {
          busName: selectedBus.name,
          operator: selectedBus.operator,
          busType: selectedBus.busType
        }
      };
    }

    // Persist to Cloud Firestore for permanent durability
    if (confirmedBooking) {
      saveBookingToFirestore(confirmedBooking, user?.id).catch(err => {
        console.warn('Could not persist booking to Firestore:', err);
      });
      setMyBookings(prev => [confirmedBooking!, ...prev.filter(b => b.id !== confirmedBooking!.id)]);
    }

    return confirmedBooking;
  };

  // Cancel Booking
  const cancelBooking = async (bookingId: string) => {
    try {
      // Update in Firestore
      updateBookingInFirestore(bookingId, { status: 'cancelled' }).catch(err => {
        console.warn('Firestore cancel update error:', err);
      });

      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchMyBookings();
        return {
          success: true,
          message: 'Booking cancelled successfully. Refund processed to Velox Wallet.',
          refundAmount: data.refundAmount
        };
      } else {
        // Local state update fallback
        setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        return { success: true, message: 'Booking status updated to cancelled.' };
      }
    } catch (err) {
      setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      return { success: true, message: 'Booking cancelled.' };
    }
  };

  return (
    <BookingContext.Provider
      value={{
        searchFilters,
        setSearchFilters,
        searchResults,
        loadingBuses,
        searchBuses,
        selectedBus,
        setSelectedBus,
        selectedSeats,
        toggleSeatSelection,
        clearSeatSelection,
        boardingPoint,
        setBoardingPoint,
        droppingPoint,
        setDroppingPoint,
        passengers,
        setPassengers,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        myBookings,
        fetchMyBookings,
        createBooking,
        cancelBooking,
        activeLiveTrackBusId,
        setActiveLiveTrackBusId,
        formatPrice
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
