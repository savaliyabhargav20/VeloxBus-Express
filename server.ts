import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { SAMPLE_BUSES, PROMO_CODES, MOCK_GPS_LOCATIONS, generateSeatLayout } from './src/data/mockData';
import { Bus, Booking, User, PromoCode } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory persistent database store during application execution
  let busesStore: Bus[] = [...SAMPLE_BUSES];
  let bookingsStore: Booking[] = [
    {
      id: 'VB-892410',
      pnr: 'PNR784291',
      busId: 'bus-101',
      source: 'Visakhapatnam',
      destination: 'Vijayawada',
      journeyDate: '2026-08-05',
      seats: ['L3', 'L4'],
      passengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: 'L3' },
        { name: 'Elena Vance', age: 27, gender: 'female', seatNumber: 'L4' }
      ],
      boardingPoint: { id: 'b1', name: 'RTC Complex Main Gate', time: '21:30', location: 'Platform 1, Visakhapatnam RTC' },
      droppingPoint: { id: 'd1', name: 'Pandit Nehru Bus Station (PNBS)', time: '03:30', location: 'Platform 12, Vijayawada' },
      contactEmail: 'alex.johnson@example.com',
      contactPhone: '+1 (555) 234-5678',
      paymentMethod: 'upi',
      totalFare: 1700,
      discountAmount: 200,
      finalAmount: 1500,
      bookingDate: '2026-08-01 14:22',
      status: 'confirmed',
      busDetails: {
        busName: 'Velox Garuda Luxury Express',
        operator: 'VeloxBus Express Lines',
        busType: 'Volvo Multi-Axle AC Sleeper'
      }
    },
    {
      id: 'VB-913402',
      pnr: 'PNR521890',
      busId: 'bus-102',
      source: 'Hyderabad',
      destination: 'Bengaluru',
      journeyDate: '2026-08-08',
      seats: ['U7'],
      passengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: 'U7' }
      ],
      boardingPoint: { id: 'b2', name: 'Gachibowli Outer Ring Road', time: '22:00', location: 'ORR Junction, Hyderabad' },
      droppingPoint: { id: 'd2', name: 'Majestic Kempegowda Bus Terminal', time: '06:30', location: 'Platform 5, Bengaluru' },
      contactEmail: 'alex.johnson@example.com',
      contactPhone: '+1 (555) 234-5678',
      paymentMethod: 'card',
      totalFare: 1400,
      discountAmount: 150,
      finalAmount: 1250,
      bookingDate: '2026-08-02 09:15',
      status: 'confirmed',
      busDetails: {
        busName: 'IntrCity SmartBus Premium',
        operator: 'IntrCity SmartBus',
        busType: 'AC Sleeper 2+1'
      }
    },
    {
      id: 'VB-774129',
      pnr: 'PNR639104',
      busId: 'bus-103',
      source: 'Chennai',
      destination: 'Madurai',
      journeyDate: '2026-08-12',
      seats: ['L12', 'L13'],
      passengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: 'L12' },
        { name: 'Elena Vance', age: 27, gender: 'female', seatNumber: 'L13' }
      ],
      boardingPoint: { id: 'b3', name: 'Koyambedu Omnibus Terminal', time: '20:15', location: 'Gate 3, Chennai' },
      droppingPoint: { id: 'd3', name: 'Mattuthavani Bus Stand', time: '04:00', location: 'Bay 8, Madurai' },
      contactEmail: 'alex.johnson@example.com',
      contactPhone: '+1 (555) 234-5678',
      paymentMethod: 'netbanking',
      totalFare: 2100,
      discountAmount: 220,
      finalAmount: 1880,
      bookingDate: '2026-08-02 11:30',
      status: 'confirmed',
      busDetails: {
        busName: 'VRL Travels Scania Multi-Axle',
        operator: 'VRL Travels',
        busType: 'Scania AC Semi-Sleeper'
      }
    },
    {
      id: 'VB-652033',
      pnr: 'PNR410298',
      busId: 'bus-104',
      source: 'Mumbai',
      destination: 'Goa',
      journeyDate: '2026-08-18',
      seats: ['U2'],
      passengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: 'U2' }
      ],
      boardingPoint: { id: 'b4', name: 'Borivali East National Park', time: '18:30', location: 'Express Highway, Mumbai' },
      droppingPoint: { id: 'd4', name: 'Panaji KTC Bus Stand', time: '07:15', location: 'Platform 2, Panaji' },
      contactEmail: 'alex.johnson@example.com',
      contactPhone: '+1 (555) 234-5678',
      paymentMethod: 'upi',
      totalFare: 1600,
      discountAmount: 180,
      finalAmount: 1420,
      bookingDate: '2026-08-02 12:45',
      status: 'confirmed',
      busDetails: {
        busName: 'Orange Tours & Travels Royal',
        operator: 'Orange Tours & Travels',
        busType: 'Mercedes-Benz AC Sleeper'
      }
    },
    {
      id: 'VB-541982',
      pnr: 'PNR883012',
      busId: 'bus-105',
      source: 'Vijayawada',
      destination: 'Tirupati',
      journeyDate: '2026-08-22',
      seats: ['L8'],
      passengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: 'L8' }
      ],
      boardingPoint: { id: 'b5', name: 'Pandit Nehru Bus Station', time: '23:00', location: 'Platform 4, Vijayawada' },
      droppingPoint: { id: 'd5', name: 'Tirupati Central Bus Station', time: '05:45', location: 'Platform 1, Tirupati' },
      contactEmail: 'alex.johnson@example.com',
      contactPhone: '+1 (555) 234-5678',
      paymentMethod: 'wallet',
      totalFare: 1100,
      discountAmount: 120,
      finalAmount: 980,
      bookingDate: '2026-08-02 15:10',
      status: 'confirmed',
      busDetails: {
        busName: 'APSRTC Amaravathi Volvo',
        operator: 'APSRTC Express',
        busType: 'Volvo B9R AC Seater'
      }
    }
  ];

  let usersStore: User[] = [
    {
      id: 'usr-demo-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 234-5678',
      role: 'user',
      walletBalance: 1500.0,
      savedPassengers: [
        { name: 'Alex Johnson', age: 29, gender: 'male', seatNumber: '' },
        { name: 'Elena Vance', age: 27, gender: 'female', seatNumber: '' }
      ]
    },
    {
      id: 'usr-admin-1',
      name: 'Admin Station',
      email: 'admin@veloxbus.com',
      phone: '+1 (555) 999-0000',
      role: 'admin',
      walletBalance: 5000.0,
      savedPassengers: []
    }
  ];

  let promosStore: PromoCode[] = [...PROMO_CODES];

  // Initialize Gemini API client optionally if process.env.GEMINI_API_KEY is available
  let genAI: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn('Gemini API key present but client failed to initialize:', e);
    }
  }

  // --- REST API ENDPOINTS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, phone, role } = req.body;
    let user = usersStore.find(u => u.email === email || u.phone === phone);

    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: email ? email.split('@')[0] : 'Valued Traveler',
        email: email || `${phone}@veloxbus.com`,
        phone: phone || '+1 555-000-0000',
        role: role === 'admin' || email === 'admin@veloxbus.com' ? 'admin' : 'user',
        walletBalance: 20.00,
        savedPassengers: []
      };
      usersStore.push(user);
    }

    res.json({
      success: true,
      token: `jwt-simulated-${user.id}-${Date.now()}`,
      user
    });
  });

  // Auth: Google Login
  app.post('/api/auth/google', (req, res) => {
    const { email, name } = req.body;
    let user = usersStore.find(u => u.email === email);
    if (!user) {
      user = {
        id: `usr-google-${Date.now()}`,
        name: name || 'Google Traveler',
        email: email || 'google.user@example.com',
        phone: '+1 (555) 888-1234',
        role: 'user',
        walletBalance: 25.00,
        savedPassengers: []
      };
      usersStore.push(user);
    }
    res.json({ success: true, token: `jwt-google-${user.id}`, user });
  });

  // Search Buses
  app.get('/api/buses/search', (req, res) => {
    const { source, destination, date, minPrice, maxPrice, busType, operators, sortBy, rating } = req.query;

    let filtered = [...busesStore];

    if (source && typeof source === 'string') {
      filtered = filtered.filter(b => b.source.toLowerCase() === source.toLowerCase());
    }
    if (destination && typeof destination === 'string') {
      filtered = filtered.filter(b => b.destination.toLowerCase() === destination.toLowerCase());
    }

    // Dynamic bus creation for any requested route if not present in static store or if few results
    if (filtered.length < 5 && source && destination && typeof source === 'string' && typeof destination === 'string') {
      const srcStr = source.trim();
      const dstStr = destination.trim();

      const dynamicOperators = [
        { name: 'VRL Travels', busType: 'Volvo Multi-Axle AC Sleeper', price: 950, discount: 850, depTime: '21:00', arrTime: '05:30', duration: '8h 30m', isElectric: false, rating: 4.8 },
        { name: 'Orange Travels', busType: 'Volvo Multi-Axle AC Sleeper', price: 1050, discount: 950, depTime: '22:15', arrTime: '06:45', duration: '8h 30m', isElectric: true, rating: 4.9 },
        { name: 'SRS Travels', busType: 'AC Sleeper', price: 850, discount: 750, depTime: '20:30', arrTime: '05:00', duration: '8h 30m', isElectric: false, rating: 4.6 },
        { name: 'APSRTC', busType: 'AC Seater', price: 550, discount: undefined, depTime: '06:00', arrTime: '12:00', duration: '6h 00m', isElectric: false, rating: 4.5 },
        { name: 'TSRTC', busType: 'AC Sleeper', price: 780, discount: 700, depTime: '21:45', arrTime: '05:45', duration: '8h 00m', isElectric: false, rating: 4.4 },
        { name: 'KSRTC', busType: 'Volvo Multi-Axle AC Sleeper', price: 920, discount: 820, depTime: '22:00', arrTime: '06:15', duration: '8h 15m', isElectric: false, rating: 4.7 },
        { name: 'GSRTC', busType: 'AC Seater', price: 480, discount: undefined, depTime: '07:30', arrTime: '13:30', duration: '6h 00m', isElectric: true, rating: 4.3 },
        { name: 'MSRTC', busType: 'AC Seater', price: 520, discount: undefined, depTime: '08:15', arrTime: '14:15', duration: '6h 00m', isElectric: false, rating: 4.2 },
        { name: 'Morning Star Travels', busType: 'AC Sleeper', price: 890, discount: 790, depTime: '22:30', arrTime: '06:30', duration: '8h 00m', isElectric: false, rating: 4.8 },
        { name: 'Patel Travels', busType: 'Non-AC Sleeper', price: 650, discount: 580, depTime: '19:45', arrTime: '04:15', duration: '8h 30m', isElectric: false, rating: 4.5 },
        { name: 'Purple Travels', busType: 'AC Seater', price: 600, discount: undefined, depTime: '14:00', arrTime: '19:30', duration: '5h 30m', isElectric: false, rating: 4.6 },
        { name: 'Laxmi Holidays', busType: 'Volvo Multi-Axle AC Sleeper', price: 1100, discount: 990, depTime: '23:00', arrTime: '07:15', duration: '8h 15m', isElectric: true, rating: 4.9 },
        { name: 'Neeta Travels', busType: 'AC Sleeper', price: 920, discount: 850, depTime: '20:15', arrTime: '04:45', duration: '8h 30m', isElectric: false, rating: 4.6 },
        { name: 'KPN Travels', busType: 'AC Sleeper', price: 880, discount: 800, depTime: '21:15', arrTime: '05:30', duration: '8h 15m', isElectric: false, rating: 4.7 },
        { name: 'Kallada Travels', busType: 'Volvo Multi-Axle AC Sleeper', price: 1020, discount: 920, depTime: '22:45', arrTime: '07:00', duration: '8h 15m', isElectric: false, rating: 4.8 }
      ];

      const generatedBuses: Bus[] = dynamicOperators.map((op, idx) => ({
        id: `dyn-${srcStr}-${dstStr}-${idx + 1}`,
        name: `${op.name} ${srcStr}-${dstStr} Express`,
        operator: op.name,
        busType: op.busType as any,
        source: srcStr,
        destination: dstStr,
        departureTime: op.depTime,
        arrivalTime: op.arrTime,
        duration: op.duration,
        price: op.price,
        discountPrice: op.discount,
        rating: op.rating,
        reviewCount: Math.floor(100 + Math.random() * 400),
        totalSeats: op.busType.includes('Sleeper') ? 24 : 32,
        availableSeatsCount: Math.floor(8 + Math.random() * 15),
        amenities: ['wifi', 'power', 'water', 'blanket', 'tracking'],
        isElectric: op.isElectric,
        gpsEnabled: true,
        cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
        boardingPoints: [
          { id: 'bp1', name: `${srcStr} Central RTC Stand`, time: op.depTime, location: 'Platform 1' },
          { id: 'bp2', name: `${srcStr} Highway Bypass`, time: '23:30', location: 'Toll Plaza' }
        ],
        droppingPoints: [
          { id: 'dp1', name: `${dstStr} Main Depot`, time: op.arrTime, location: 'Arrival Terminal' }
        ],
        seatLayout: generateSeatLayout(op.busType.includes('Sleeper'))
      }));

      // Add to store so detail view and booking creation works seamless
      generatedBuses.forEach(b => {
        if (!busesStore.some(existing => existing.id === b.id)) {
          busesStore.push(b);
        }
      });

      filtered = busesStore.filter(b => 
        b.source.toLowerCase() === srcStr.toLowerCase() && 
        b.destination.toLowerCase() === dstStr.toLowerCase()
      );
    }

    if (minPrice) {
      filtered = filtered.filter(b => (b.discountPrice || b.price) >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(b => (b.discountPrice || b.price) <= Number(maxPrice));
    }
    if (rating) {
      filtered = filtered.filter(b => b.rating >= Number(rating));
    }
    if (busType && typeof busType === 'string') {
      const types = busType.split(',').map(t => t.trim().toLowerCase());
      filtered = filtered.filter(b => 
        types.some(t => 
          b.busType.toLowerCase().includes(t) || t.includes(b.busType.toLowerCase())
        )
      );
    }
    if (operators && typeof operators === 'string') {
      const opList = operators.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(b => opList.includes(b.operator.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'price_low') {
      filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'departure_early') {
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    res.json({
      success: true,
      count: filtered.length,
      buses: filtered
    });
  });

  // Get Single Bus Details with Seat Layout
  app.get('/api/buses/:id', (req, res) => {
    const bus = busesStore.find(b => b.id === req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.json({ success: true, bus });
  });

  // Validate Promo Code
  app.post('/api/promos/validate', (req, res) => {
    const { code, amount } = req.body;
    const promo = promosStore.find(p => p.code.toUpperCase() === (code || '').toUpperCase());

    if (!promo) {
      return res.status(400).json({ success: false, message: 'Invalid or expired promotional code' });
    }

    if (amount < promo.minBookingValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum ticket fare of $${promo.minBookingValue} required for promo code ${promo.code}`
      });
    }

    let discount = 0;
    if (promo.discountType === 'fixed') {
      discount = promo.value;
    } else {
      discount = (amount * promo.value) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    }

    res.json({
      success: true,
      code: promo.code,
      discount: Math.round(discount * 100) / 100,
      description: promo.description
    });
  });

  // Create Booking
  app.post('/api/bookings', (req, res) => {
    const bookingReq = req.body;
    let bus = busesStore.find(b => b.id === bookingReq.busId);

    if (!bus) {
      bus = {
        id: bookingReq.busId || `bus-${Date.now()}`,
        name: `${bookingReq.source || 'Express'} - ${bookingReq.destination || 'Intercity'} Express`,
        operator: 'VeloxBus Express Lines',
        busType: 'Volvo Multi-Axle AC Sleeper',
        source: bookingReq.source || 'Visakhapatnam',
        destination: bookingReq.destination || 'Vijayawada',
        departureTime: '21:00',
        arrivalTime: '05:30',
        duration: '8h 30m',
        price: (bookingReq.totalFare && bookingReq.seats?.length) ? Math.round(bookingReq.totalFare / bookingReq.seats.length) : 750,
        rating: 4.8,
        reviewCount: 120,
        totalSeats: 24,
        availableSeatsCount: 16,
        amenities: ['wifi', 'power', 'water', 'blanket'],
        boardingPoints: [bookingReq.boardingPoint || { id: 'bp-1', name: 'Main Bus Station', time: '21:00', location: 'City Center' }],
        droppingPoints: [bookingReq.droppingPoint || { id: 'dp-1', name: 'Central Terminal', time: '05:30', location: 'Ring Road' }],
        seatLayout: generateSeatLayout(true),
        cancellationPolicy: '85% instant refund up to 4 hours before departure.'
      };
      busesStore.push(bus);
    }

    // Mark seats as booked
    if (bookingReq.seats && Array.isArray(bookingReq.seats)) {
      bus.seatLayout = bus.seatLayout.map(seat => {
        if (bookingReq.seats.includes(seat.id)) {
          return { ...seat, status: 'booked' };
        }
        return seat;
      });
      bus.availableSeatsCount = bus.seatLayout.filter(s => s.status === 'available' || s.status === 'women_only').length;
    }

    const pnr = `PNR${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: Booking = {
      ...bookingReq,
      id: `VB-${Math.floor(100000 + Math.random() * 900000)}`,
      pnr,
      bookingDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'confirmed',
      busDetails: {
        busName: bus.name,
        operator: bus.operator,
        busType: bus.busType
      }
    };

    bookingsStore.unshift(newBooking);

    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking
    });
  });

  // Get User's Bookings
  app.get('/api/bookings/my-bookings', (req, res) => {
    res.json({ success: true, bookings: bookingsStore });
  });

  // Cancel Booking
  app.post('/api/bookings/:id/cancel', (req, res) => {
    const booking = bookingsStore.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'cancelled';

    // Free up seats in bus layout
    const bus = busesStore.find(b => b.id === booking.busId);
    if (bus) {
      bus.seatLayout = bus.seatLayout.map(seat => {
        if (booking.seats.includes(seat.id)) {
          return { ...seat, status: 'available' };
        }
        return seat;
      });
      bus.availableSeatsCount = bus.seatLayout.filter(s => s.status === 'available' || s.status === 'women_only').length;
    }

    const refundAmount = Math.round(booking.finalAmount * 0.85 * 100) / 100;

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      refundAmount,
      booking
    });
  });

  // Live GPS Tracking Endpoint
  app.get('/api/buses/:id/live-location', (req, res) => {
    const busId = req.params.id;
    const liveData = MOCK_GPS_LOCATIONS[busId] || {
      busId,
      busName: 'Velox Highway Cruiser',
      currentLocation: {
        lat: 42.1015,
        lng: -72.5898,
        placeName: 'Massachusetts Turnpike Mile 84, MA'
      },
      speedKmH: 74,
      nextStop: 'South Station Bus Terminal',
      etaNextStop: '32 mins',
      finalEta: 'Expected on Time',
      delayMinutes: 0,
      progressPercent: 78,
      routeCoordinates: [
        { lat: 40.7128, lng: -74.006, name: 'Origin Stop' },
        { lat: 42.1015, lng: -72.5898, name: 'Current Location' },
        { lat: 42.3521, lng: -71.0552, name: 'Destination' }
      ]
    };

    res.json({ success: true, liveLocation: liveData });
  });

  // Customer Support AI Assistant endpoint
  app.post('/api/support/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Try Gemini if available
    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are VeloxBot, the intelligent customer service assistant for VeloxBus, a top bus booking platform.
Answer the customer's query clearly, politely, and concisely (2-4 sentences max). Provide helpful details regarding bus schedules, seat upgrades, baggage policies (2 bags up to 20kg included free), refunds (85% refund if cancelled 6+ hours before), live bus tracking, or promo codes like VELOX100.
User query: "${prompt}"`
        });

        if (response && response.text) {
          return res.json({ success: true, reply: response.text });
        }
      } catch (err) {
        console.warn('Gemini AI generation error fallback to rule engine:', err);
      }
    }

    // Smart fallback responses if Gemini is off or key missing
    const query = prompt.toLowerCase();
    let reply = "Hello! I'm VeloxBot. How can I help with your journey today?";

    if (query.includes('cancel') || query.includes('refund')) {
      reply = "Cancellation Policy: Cancellations made 6+ hours before departure receive an 85% instant refund to your Velox Wallet or original payment method. You can cancel directly under 'My Bookings'.";
    } else if (query.includes('bag') || query.includes('luggage')) {
      reply = "Baggage Policy: Each passenger is allowed 1 carry-on item and up to 2 checked bags (max 20kg each) free of charge. Extra baggage can be booked at the boarding station.";
    } else if (query.includes('track') || query.includes('gps')) {
      reply = "Live GPS Tracking is available 30 minutes before your departure time! Click 'Track Live' inside your ticket in 'My Bookings' to see real-time speed, location, and ETA.";
    } else if (query.includes('promo') || query.includes('discount') || query.includes('coupon')) {
      reply = "You can use promo code 'VELOX100' for flat $15 off on your first booking, or 'SUPERBUS' for 20% off on Sleeper coaches!";
    } else if (query.includes('wifi') || query.includes('amenit')) {
      reply = "Most VeloxBus luxury coaches come equipped with free High-Speed Wi-Fi, individual charging ports, bottled water, and air conditioning.";
    } else {
      reply = `Thank you for reaching out! Regarding "${prompt}": You can manage bookings, view seat layouts, and track your coach live on VeloxBus. Need anything else?`;
    }

    res.json({ success: true, reply });
  });

  // Google Maps Grounding Guide Endpoint using gemini-3.5-flash with googleMaps tool
  app.post('/api/maps/grounding-guide', async (req, res) => {
    const { stationOrCity, queryType, userLat, userLng, destination } = req.body;

    if (!stationOrCity) {
      return res.status(400).json({ success: false, message: 'stationOrCity parameter is required' });
    }

    const placeQuery = stationOrCity.trim();
    let prompt = `Provide an accurate, up-to-date guide for bus travelers regarding "${placeQuery}"`;
    if (destination) {
      prompt += ` traveling towards "${destination}"`;
    }

    if (queryType === 'amenities') {
      prompt += `. List nearby verified amenities around this bus stop/station including waiting lounges, 24/7 food stalls, cafes, ATMs, clean restrooms, luggage cloakrooms, auto/taxi stands, and nearest metro or local transit connections.`;
    } else if (queryType === 'attractions') {
      prompt += `. Highlight top nearby attractions, landmarks, popular markets, and cultural spots within easy reach of the bus terminal.`;
    } else if (queryType === 'safety_tips') {
      prompt += `. Provide key navigation and night-safety tips, best boarding points, parking options, and terminal entry gates for bus passengers.`;
    } else {
      prompt += `. Provide a concise traveler overview including the exact station location, nearby food and refreshments, transit connectivity (cabs/metro), and useful tips for passengers arriving or departing here.`;
    }

    // Call Gemini with googleMaps grounding
    if (genAI) {
      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
      for (const modelName of modelsToTry) {
        try {
          const config: any = {
            tools: [{ googleMaps: {} }]
          };

          if (userLat && userLng) {
            config.toolConfig = {
              retrievalConfig: {
                latLng: {
                  latitude: Number(userLat),
                  longitude: Number(userLng)
                }
              }
            };
          }

          const response = await genAI.models.generateContent({
            model: modelName,
            contents: prompt,
            config
          });

          if (response && response.text) {
            // Extract Maps Grounding URLs and Place Information
            const candidate = response.candidates?.[0];
            const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
            
            const places: Array<{ title: string; uri: string; address?: string }> = [];
            
            groundingChunks.forEach((chunk: any) => {
              if (chunk.maps) {
                places.push({
                  title: chunk.maps.title || 'View on Google Maps',
                  uri: chunk.maps.uri || '',
                  address: chunk.maps.placeAnswerSources?.reviewSnippets?.[0] || chunk.maps.address || ''
                });
              } else if (chunk.web) {
                places.push({
                  title: chunk.web.title || 'Reference Link',
                  uri: chunk.web.uri || ''
                });
              }
            });

            return res.json({
              success: true,
              modelUsed: modelName,
              guideMarkdown: response.text,
              groundedPlaces: places,
              groundingMetadata: candidate?.groundingMetadata || null
            });
          }
        } catch (err: any) {
          console.warn(`Maps grounding failed with model ${modelName}:`, err?.message || err);
          // Continue to next model in loop
        }
      }
    }

    // High quality contextual fallback if API key not present
    const fallbackPlaces = [
      {
        title: `${placeQuery} Central Terminal`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery + ' bus station')}`,
        address: `Main Boarding Bay & Passenger Waiting Concourse, ${placeQuery}`
      },
      {
        title: `${placeQuery} Metro & Transit Hub`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery + ' transit metro')}`,
        address: `Public transport feeder and prepaid auto stand, ${placeQuery}`
      },
      {
        title: `${placeQuery} Refreshments & 24/7 Food Court`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery + ' restaurants food')}`,
        address: `Convenience stalls, ATMs, and tea kiosks near ${placeQuery}`
      }
    ];

    const fallbackGuide = `### 📍 Grounded Station & Area Guide for ${placeQuery}

**Overview & Connectivity:**
${placeQuery} is a primary transit hub with multi-bay platforms for state and private luxury sleeper buses. App-based cabs (Uber, Ola) and prepaid autos are readily accessible 24/7 at the arrival gates.

**Key Passenger Amenities:**
- **Waiting Lounges:** Air-conditioned executive lounge and general waiting halls available on Platform 1.
- **Luggage Storage:** Safe cloakroom facilities situated near the main ticketing office.
- **Food & Beverages:** Multiple snack bars, filter coffee stalls, and 24-hour convenience stores within 100 meters.
- **Safety & Restrooms:** Clean paid bio-toilets and dedicated women passenger help desks.

*Tip:* Arrive at least 15-20 minutes before your departure to locate your specific boarding bay and verify your luggage tags.`;

    res.json({
      success: true,
      modelUsed: 'offline-grounded-fallback',
      guideMarkdown: fallbackGuide,
      groundedPlaces: fallbackPlaces
    });
  });

  // Admin APIs: Get stats
  app.get('/api/admin/stats', (req, res) => {
    const totalBookings = bookingsStore.length;
    const totalRevenue = bookingsStore.reduce((acc, b) => acc + (b.status !== 'cancelled' ? b.finalAmount : 0), 0);
    const activeBuses = busesStore.length;
    const totalUsers = usersStore.length;

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        activeBuses,
        totalUsers,
        occupancyRate: '78%'
      }
    });
  });

  // Admin API: Add new Bus
  app.post('/api/admin/buses', (req, res) => {
    const newBus: Bus = {
      ...req.body,
      id: `bus-${Date.now()}`,
      availableSeatsCount: req.body.totalSeats || 24,
      seatLayout: req.body.seatLayout || []
    };
    busesStore.push(newBus);
    res.json({ success: true, bus: newBus });
  });

  // Serve Vite in dev mode or static dist in production mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeloxBus Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
