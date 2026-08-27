export type BusType = string;

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface BoardingPoint {
  id: string;
  name: string;
  time: string;
  location: string;
}

export interface DroppingPoint {
  id: string;
  name: string;
  time: string;
  location: string;
}

export interface Seat {
  id: string; // e.g., 'L1', 'U5', '12A'
  number: string;
  deck: 'lower' | 'upper';
  type: 'seater' | 'sleeper';
  price: number;
  status: 'available' | 'booked' | 'selected' | 'women_only';
  isWindow?: boolean;
}

export interface BusReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Bus {
  id: string;
  name: string;
  operator: string;
  busType: BusType;
  source: string;
  destination: string;
  departureTime: string; // e.g. "21:30"
  arrivalTime: string;   // e.g. "06:15"
  duration: string;      // e.g. "8h 45m"
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  totalSeats: number;
  availableSeatsCount: number;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  seatLayout: Seat[];
  reviews?: BusReview[];
  cancellationPolicy: string;
  isElectric?: boolean;
  gpsEnabled?: boolean;
}

export interface Passenger {
  id?: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
}

export interface BookingRequest {
  busId: string;
  source: string;
  destination: string;
  journeyDate: string;
  seats: string[]; // seat ids
  passengers: Passenger[];
  boardingPoint: BoardingPoint;
  droppingPoint: DroppingPoint;
  contactEmail: string;
  contactPhone: string;
  gstNumber?: string;
  companyName?: string;
  promoCode?: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'paylater' | 'emi';
  totalFare: number;
  discountAmount: number;
  finalAmount: number;
}

export interface Booking extends BookingRequest {
  id: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  qrCodeUrl?: string;
  pnr: string;
  busDetails: {
    busName: string;
    operator: string;
    busType: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  walletBalance: number;
  savedPassengers: Passenger[];
  savedCards?: { last4: string; brand: string; expiry: string }[];
}

export interface SearchFilters {
  source: string;
  destination: string;
  date: string;
  priceRange: [number, number];
  busTypes: string[];
  departureTimeSlots: string[]; // e.g., 'morning', 'afternoon', 'evening', 'night'
  amenities: string[];
  operators: string[];
  minRating: number;
  sortBy: 'price_low' | 'price_high' | 'rating' | 'departure_early' | 'duration_short';
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g., 20% or $10/₹100
  maxDiscount?: number;
  minBookingValue: number;
  description: string;
  expiryDate: string;
}

export interface LiveLocationData {
  busId: string;
  busName: string;
  currentLocation: {
    lat: number;
    lng: number;
    placeName: string;
  };
  speedKmH: number;
  nextStop: string;
  etaNextStop: string;
  finalEta: string;
  delayMinutes: number;
  progressPercent: number;
  routeCoordinates: { lat: number; lng: number; name: string }[];
}
