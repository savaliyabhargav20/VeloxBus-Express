import { Bus, PromoCode, Amenity } from '../types';

export const GOVERNMENT_OPERATORS = [
  "GSRTC",
  "MSRTC",
  "KSRTC",
  "APSRTC",
  "TSRTC",
  "TNSTC",
  "RSRTC",
  "UPSRTC",
  "HRTC",
  "OSRTC",
  "NWKRTC",
  "BMTC",
  "DTC",
  "MTC Chennai",
  "BEST Mumbai",
  "PMPML Pune",
  "CTU Chandigarh",
  "JKSRTC",
  "ASTC",
  "WBTC",
  "SBSTC",
  "NBSTC"
];

export const BUS_OPERATORS = [
  // National & Multi-State Operators
  "VRL Travels",
  "SRS Travels",
  "Orange Travels",
  "KPN Travels",
  "Parveen Travels",
  "Kallada Travels",
  "Sharma Travels",
  "Rajdhani Express",
  "National Travels",
  "Seabird Tourists",
  "Jabbar Travels",
  "Neeta Travels",
  "Paulo Travels",
  "Mahasagar Travels",
  "Chartered Bus",
  "Shreenath Travels",
  "Rathimeena Travels",
  "Sri Krishna Travels",
  "YBM Travels",
  "Kesineni Travels",

  // Government Operators
  "GSRTC",
  "MSRTC",
  "KSRTC",
  "APSRTC",
  "TSRTC",
  "TNSTC",
  "RSRTC",
  "UPSRTC",
  "HRTC",
  "OSRTC",
  "NWKRTC",
  "BMTC",
  "DTC",
  "MTC Chennai",
  "BEST Mumbai",
  "PMPML Pune",
  "CTU Chandigarh",
  "JKSRTC",
  "ASTC",
  "WBTC",
  "SBSTC",
  "NBSTC",

  // Gujarat
  "Patel Travels",
  "Eagle Travels",
  "Laxmi Travels",
  "Mahadev Travels",
  "Shiv Shakti Travels",
  "Raj Travels",
  "Shree Hari Travels",
  "Gujarat Travels",
  "Maa Travels",
  "Sai Travels",

  // Maharashtra
  "Purple Travels",
  "Royal Travels",
  "Citizen Travels",
  "Mahalaxmi Travels",
  "Sangitam Travels",

  // Karnataka
  "Sugama Tourists",
  "Canara Pinto",
  "Durgamba Motors",
  "Anand Travels",
  "Venkateshwara Travels",

  // Tamil Nadu
  "Universal Travels",
  "Vetri Travels",
  "ABT Travels",
  "Kallada G4",

  // Kerala
  "Greenline Travels",
  "Atlas Travels",
  "Kerala Lines",

  // Telangana & Andhra Pradesh
  "Morning Star Travels",
  "Diwakar Travels",
  "Komitla Travels",
  "Sri KVR Travels",
  "Meghana Travels",

  // Rajasthan
  "Maharaja Travels",
  "Shreenath Tour and Travels",
  "Rajasthan Travels",

  // Delhi & North India
  "Laxmi Holidays",
  "Hans Travels",
  "Northern Travels",
  "Royal Cruiser",
  "Indo Canadian Transport"
];

const rawBusTypes = [
  "AC Sleeper",
  "Non-AC Sleeper",
  "AC Seater",
  "Non-AC Seater",
  "Volvo AC",
  "Volvo Multi-Axle",
  "Mercedes Benz",
  "Scania AC",
  "Bharat Benz",
  "Luxury Sleeper",
  "Semi Sleeper",
  "Executive Coach",
  "Express",
  "Ordinary",
  "Mini Bus",
  "Electric Bus",
  "Shivshahi",
  "Garuda",
  "Rajdhani",
  "Intercity"
];

// Deduplicated list of Bus & Seating types
export const BUS_TYPES = Array.from(new Set(rawBusTypes));

export const POPULAR_CITIES = [
  'Visakhapatnam',
  'Vijayawada',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Coimbatore',
  'Delhi',
  'Jaipur',
  'Lucknow',
  'Varanasi',
  'Kolkata',
  'Siliguri',
  'Patna',
  'Ahmedabad',
  'Surat',
  'Guwahati',
  'Kochi',
  'Thiruvananthapuram'
];

export const AMENITIES_LIST: Amenity[] = [
  { id: 'wifi', name: 'High-Speed Wi-Fi', icon: 'Wifi' },
  { id: 'power', name: 'Charging Port', icon: 'Zap' },
  { id: 'water', name: 'Water Bottle', icon: 'Droplet' },
  { id: 'blanket', name: 'Blanket & Pillow', icon: 'Bed' },
  { id: 'entertainment', name: 'Personal Screen / Movies', icon: 'Tv' },
  { id: 'tracking', name: 'Live GPS Tracking', icon: 'Navigation' },
  { id: 'reading_light', name: 'Reading Light', icon: 'Lamp' },
  { id: 'emergency', name: 'Emergency Button', icon: 'ShieldAlert' },
  { id: 'snack', name: 'Complimentary Snacks', icon: 'Utensils' }
];

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'VELOX100',
    discountType: 'fixed',
    value: 100,
    minBookingValue: 400,
    description: 'Flat ₹100 off on your first bus reservation!',
    expiryDate: '2026-12-31'
  },
  {
    code: 'SUPERBUS',
    discountType: 'percentage',
    value: 20,
    maxDiscount: 200,
    minBookingValue: 500,
    description: 'Get 20% instant discount on Sleeper buses!',
    expiryDate: '2026-11-30'
  },
  {
    code: 'WEEKENDDEAL',
    discountType: 'fixed',
    value: 150,
    minBookingValue: 600,
    description: 'Save ₹150 on weekend trips',
    expiryDate: '2026-10-15'
  }
];

export function generateSeatLayout(isSleeper: boolean): any[] {
  const seats: any[] = [];
  if (isSleeper) {
    // 12 lower deck berths, 12 upper deck berths
    for (let i = 1; i <= 12; i++) {
      const status = i % 5 === 0 ? 'booked' : i % 7 === 0 ? 'women_only' : 'available';
      seats.push({
        id: `L${i}`,
        number: `L${i}`,
        deck: 'lower',
        type: 'sleeper',
        price: 45,
        status: status,
        isWindow: i % 2 !== 0
      });
      seats.push({
        id: `U${i}`,
        number: `U${i}`,
        deck: 'upper',
        type: 'sleeper',
        price: 48,
        status: i % 4 === 0 ? 'booked' : 'available',
        isWindow: i % 2 !== 0
      });
    }
  } else {
    // Seater bus: 32 seats (2x2 layout)
    const rows = 8;
    const cols = ['A', 'B', 'C', 'D'];
    let count = 1;
    for (let r = 1; r <= rows; r++) {
      cols.forEach((c, idx) => {
        const seatId = `${r}${c}`;
        const isBooked = (r * 4 + idx) % 6 === 0;
        const isWomen = (r * 4 + idx) % 9 === 0;
        seats.push({
          id: seatId,
          number: seatId,
          deck: 'lower',
          type: 'seater',
          price: 32,
          status: isBooked ? 'booked' : isWomen ? 'women_only' : 'available',
          isWindow: c === 'A' || c === 'D'
        });
        count++;
      });
    }
  }
  return seats;
}

export const SAMPLE_BUSES: Bus[] = [
  {
    id: 'bus-101',
    name: 'Velox Garuda Luxury Express',
    operator: 'VeloxBus Express Lines',
    busType: 'Volvo Multi-Axle AC Sleeper',
    source: 'Visakhapatnam',
    destination: 'Vijayawada',
    departureTime: '21:30',
    arrivalTime: '03:45',
    duration: '6h 15m',
    price: 850,
    discountPrice: 750,
    rating: 4.8,
    reviewCount: 342,
    totalSeats: 24,
    availableSeatsCount: 16,
    amenities: ['wifi', 'power', 'water', 'blanket', 'tracking', 'entertainment'],
    isElectric: true,
    gpsEnabled: true,
    cancellationPolicy: 'Free cancellation up to 6 hours before departure. 85% refund.',
    boardingPoints: [
      { id: 'b1', name: 'RTC Complex Main Gate', time: '21:30', location: 'Platform 1, Visakhapatnam RTC' },
      { id: 'b2', name: 'Gajuwaka Junction', time: '22:00', location: 'Opposite High School Road' }
    ],
    droppingPoints: [
      { id: 'd1', name: 'Pandit Nehru Bus Station (PNBS)', time: '03:30', location: 'Platform 12, Vijayawada' },
      { id: 'd2', name: 'Benz Circle', time: '03:45', location: 'Near Flyover Signal' }
    ],
    seatLayout: generateSeatLayout(true),
    reviews: [
      { id: 'r1', userName: 'Rajesh K.', rating: 5, date: '2026-07-28', comment: 'Punctual departure from RTC Complex, super clean sleeper berth, and fast Wi-Fi!' },
      { id: 'r2', userName: 'Priya M.', rating: 4.5, date: '2026-07-25', comment: 'Great legroom and comfortable pillow provided on the journey.' }
    ]
  },
  {
    id: 'bus-102',
    name: 'Coastal Express AC Seater',
    operator: 'APSRTC Super Luxury',
    busType: 'AC Seater',
    source: 'Visakhapatnam',
    destination: 'Vijayawada',
    departureTime: '06:00',
    arrivalTime: '11:45',
    duration: '5h 45m',
    price: 550,
    rating: 4.4,
    reviewCount: 189,
    totalSeats: 32,
    availableSeatsCount: 22,
    amenities: ['wifi', 'power', 'water', 'tracking'],
    gpsEnabled: true,
    cancellationPolicy: 'Flat cancellation fee before 12 hours.',
    boardingPoints: [
      { id: 'b1', name: 'Dwaraka Bus Station (RTC Complex)', time: '06:00', location: 'Platform 8' }
    ],
    droppingPoints: [
      { id: 'd1', name: 'PNBS Bus Station', time: '11:45', location: 'Vijayawada' }
    ],
    seatLayout: generateSeatLayout(false)
  },
  {
    id: 'bus-103',
    name: 'Deccan Queen Multi-Axle Sleeper',
    operator: 'VeloxBus Express Lines',
    busType: 'AC Sleeper',
    source: 'Mumbai',
    destination: 'Pune',
    departureTime: '07:30',
    arrivalTime: '10:45',
    duration: '3h 15m',
    price: 700,
    discountPrice: 600,
    rating: 4.9,
    reviewCount: 512,
    totalSeats: 24,
    availableSeatsCount: 11,
    amenities: ['wifi', 'power', 'water', 'blanket', 'reading_light', 'snack', 'tracking'],
    gpsEnabled: true,
    cancellationPolicy: '100% refund up to 12 hours prior to departure.',
    boardingPoints: [
      { id: 'b1', name: 'Dadar Asiad Bus Stand', time: '07:30', location: 'Near TT Circle' },
      { id: 'b2', name: 'Vashi Plaza', time: '08:15', location: 'Sion Panvel Highway' }
    ],
    droppingPoints: [
      { id: 'd1', name: 'Swargate Bus Stand', time: '10:30', location: 'Swargate, Pune' },
      { id: 'd2', name: 'Wakad Highway Bridge', time: '10:45', location: 'Pune Bypass' }
    ],
    seatLayout: generateSeatLayout(true)
  },
  {
    id: 'bus-104',
    name: 'Silicon Valley Volvo AC Express',
    operator: 'VeloxBus Express Lines',
    busType: 'Volvo Multi-Axle AC Sleeper',
    source: 'Bengaluru',
    destination: 'Hyderabad',
    departureTime: '22:00',
    arrivalTime: '06:30',
    duration: '8h 30m',
    price: 1250,
    discountPrice: 1100,
    rating: 4.8,
    reviewCount: 420,
    totalSeats: 24,
    availableSeatsCount: 15,
    amenities: ['wifi', 'power', 'water', 'blanket', 'tracking'],
    gpsEnabled: true,
    cancellationPolicy: 'Free cancellation before 6 hours.',
    boardingPoints: [
      { id: 'b1', name: 'Majestic Kempegowda Bus Station', time: '22:00', location: 'Platform 18' },
      { id: 'b2', name: 'Hebbal Esteem Mall', time: '22:30', location: 'Flyover Service Road' }
    ],
    droppingPoints: [
      { id: 'd1', name: 'Ameerpet Metro Station', time: '06:00', location: 'Main Highway' },
      { id: 'd2', name: 'MGBS Hyderabad', time: '06:30', location: 'Platform 5' }
    ],
    seatLayout: generateSeatLayout(true)
  },
  {
    id: 'bus-105',
    name: 'Pink City Royal Coach',
    operator: 'Rajasthan Express Travels',
    busType: 'Electric AC Seater',
    source: 'Delhi',
    destination: 'Jaipur',
    departureTime: '06:30',
    arrivalTime: '11:15',
    duration: '4h 45m',
    price: 750,
    discountPrice: 650,
    rating: 4.7,
    reviewCount: 290,
    totalSeats: 32,
    availableSeatsCount: 19,
    amenities: ['wifi', 'power', 'water', 'tracking', 'entertainment'],
    isElectric: true,
    gpsEnabled: true,
    cancellationPolicy: 'Free cancellation up to 4 hours.',
    boardingPoints: [
      { id: 'b1', name: 'Kashmere Gate ISBT', time: '06:30', location: 'Gate 3' },
      { id: 'b2', name: 'Dhaula Kuan', time: '07:00', location: 'Metro Station Bus Bay' }
    ],
    droppingPoints: [
      { id: 'd1', name: 'Sindhi Camp Bus Stand', time: '11:15', location: 'Jaipur' }
    ],
    seatLayout: generateSeatLayout(false)
  }
];

export const MOCK_GPS_LOCATIONS: Record<string, any> = {
  'bus-101': {
    busId: 'bus-101',
    busName: 'Velox Luxury Express',
    currentLocation: {
      lat: 41.8239,
      lng: -71.4128,
      placeName: 'Providence Interstate Bypass, RI'
    },
    speedKmH: 72,
    nextStop: 'South Station Bus Terminal',
    etaNextStop: '45 mins',
    finalEta: '12:30 PM',
    delayMinutes: 0,
    progressPercent: 68,
    routeCoordinates: [
      { lat: 40.7589, lng: -73.9851, name: 'New York - Port Authority' },
      { lat: 41.1792, lng: -73.1894, name: 'Bridgeport Checkpoint' },
      { lat: 41.3083, lng: -72.9279, name: 'New Haven' },
      { lat: 41.8239, lng: -71.4128, name: 'Providence (Current Location)' },
      { lat: 42.3521, lng: -71.0552, name: 'Boston - South Station' }
    ]
  },
  'bus-103': {
    busId: 'bus-103',
    busName: 'NightCruiser Royal Sleeper',
    currentLocation: {
      lat: 39.9526,
      lng: -75.1652,
      placeName: 'Philadelphia Transit Hub, PA'
    },
    speedKmH: 68,
    nextStop: 'Baltimore Penn Station',
    etaNextStop: '50 mins',
    finalEta: '03:45 AM',
    delayMinutes: 5,
    progressPercent: 42,
    routeCoordinates: [
      { lat: 40.7128, lng: -74.0060, name: 'New York - Penn Station' },
      { lat: 40.2206, lng: -74.7597, name: 'Trenton Stop' },
      { lat: 39.9526, lng: -75.1652, name: 'Philadelphia (Current)' },
      { lat: 39.2904, lng: -76.6122, name: 'Baltimore' },
      { lat: 38.8977, lng: -77.0365, name: 'Washington DC - Union Station' }
    ]
  }
};
