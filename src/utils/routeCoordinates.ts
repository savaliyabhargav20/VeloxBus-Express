export interface RouteStop {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  type: 'origin' | 'boarding' | 'waypoint' | 'rest_stop' | 'dropping' | 'destination';
  distanceKm: number;
  elevationMeters: number;
  timeOffsetMinutes: number;
  description: string;
  amenities?: string[];
}

export interface RouteData {
  highwayName: string;
  highwayCode: string;
  totalDistanceKm: number;
  estimatedDuration: string;
  roadType: string;
  tollCount: number;
  restStopsCount: number;
  safetyScore: number;
  sourceCity: string;
  destCity: string;
  stops: RouteStop[];
  elevationProfile: { km: number; elevation: number; label: string }[];
}

// Major Indian cities coordinate index
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string; elevation: number }> = {
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', elevation: 45 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh', elevation: 39 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana', elevation: 542 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', elevation: 920 },
  'Bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', elevation: 920 },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', elevation: 14 },
  'Mumbai': { lat: 18.9220, lng: 72.8347, state: 'Maharashtra', elevation: 10 },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra', elevation: 560 },
  'Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR', elevation: 216 },
  'New Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR', elevation: 216 },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', elevation: 431 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat', elevation: 53 },
  'Surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat', elevation: 13 },
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal', elevation: 9 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu', elevation: 411 },
  'Madurai': { lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu', elevation: 136 },
  'Kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala', elevation: 5 },
  'Trivandrum': { lat: 8.5241, lng: 76.9366, state: 'Kerala', elevation: 10 },
  'Goa': { lat: 15.2993, lng: 74.1240, state: 'Goa', elevation: 30 },
  'Panaji': { lat: 15.4909, lng: 73.8278, state: 'Goa', elevation: 10 },
  'Tirupati': { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh', elevation: 161 },
  'Rajahmundry': { lat: 17.0005, lng: 81.8040, state: 'Andhra Pradesh', elevation: 25 },
  'Guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh', elevation: 33 },
  'Nellore': { lat: 14.4426, lng: 79.9865, state: 'Andhra Pradesh', elevation: 19 },
  'Kurnool': { lat: 15.8281, lng: 78.0373, state: 'Andhra Pradesh', elevation: 274 },
  'Warangal': { lat: 17.9689, lng: 79.5941, state: 'Telangana', elevation: 270 },
  'Mysore': { lat: 12.2958, lng: 76.6394, state: 'Karnataka', elevation: 770 },
  'Mangalore': { lat: 12.9141, lng: 74.8560, state: 'Karnataka', elevation: 22 },
  'Hubli': { lat: 15.3647, lng: 75.1240, state: 'Karnataka', elevation: 671 },
  'Belgaum': { lat: 15.8497, lng: 74.4977, state: 'Karnataka', elevation: 762 },
  'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra', elevation: 310 },
  'Nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra', elevation: 600 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433, state: 'Maharashtra', elevation: 568 },
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', elevation: 553 },
  'Bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh', elevation: 527 },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', elevation: 123 },
  'Agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh', elevation: 171 },
  'Varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh', elevation: 81 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Punjab / Haryana', elevation: 321 },
  'Dehradun': { lat: 30.3165, lng: 78.0322, state: 'Uttarakhand', elevation: 640 },
  'Shimla': { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh', elevation: 2276 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245, state: 'Odisha', elevation: 45 },
  'Puri': { lat: 19.8135, lng: 85.8312, state: 'Odisha', elevation: 10 },
  'Patna': { lat: 25.5941, lng: 85.1376, state: 'Bihar', elevation: 53 },
  'Ranchi': { lat: 23.3441, lng: 85.3096, state: 'Jharkhand', elevation: 651 },
  'Guwahati': { lat: 26.1445, lng: 91.7362, state: 'Assam', elevation: 55 }
};

// Known Highway Corridors between frequent City pairs
interface HighwayPreset {
  highwayName: string;
  highwayCode: string;
  roadType: string;
  tollCount: number;
  intermediatePoints: { name: string; city: string; lat: number; lng: number; type: RouteStop['type']; elevation: number; desc: string; amenities?: string[] }[];
}

const PRESET_CORRIDORS: Record<string, HighwayPreset> = {
  'Visakhapatnam_Vijayawada': {
    highwayName: 'NH-16 Coastal Expressway (AH-45)',
    highwayCode: 'NH 16',
    roadType: '6-Lane Access-Controlled Highway',
    tollCount: 5,
    intermediatePoints: [
      { name: 'Gajuwaka Industrial Hub', city: 'Visakhapatnam', lat: 17.6904, lng: 83.1950, type: 'boarding', elevation: 35, desc: 'City exit boarding concourse & passenger shelter' },
      { name: 'Anakapalle Bypass Concourse', city: 'Anakapalle', lat: 17.6913, lng: 83.0039, type: 'waypoint', elevation: 30, desc: 'Junction connecting NH16 four-lane express corridor' },
      { name: 'Tuni Highway Toll Plaza & Oasis Food Court', city: 'Tuni', lat: 17.3540, lng: 82.5510, type: 'rest_stop', elevation: 28, desc: '20-min Dinner & Refreshments halt with clean restrooms', amenities: ['Food Court', 'Restrooms', 'EV Charging', 'ATM'] },
      { name: 'Annavaram Temple Overbridge Point', city: 'Annavaram', lat: 17.2798, lng: 82.4045, type: 'waypoint', elevation: 32, desc: 'Scenic pilgrimage corridor with dual carriageway' },
      { name: 'Rajahmundry Godavari Arch Bridge Junction', city: 'Rajahmundry', lat: 16.9891, lng: 81.7840, type: 'waypoint', elevation: 26, desc: 'Godavari River crossing over majestic modern road bridge' },
      { name: 'Eluru Highway Bypass Junction', city: 'Eluru', lat: 16.7107, lng: 81.0952, type: 'waypoint', elevation: 22, desc: 'Fast bypass lane avoiding inner city congestion' },
      { name: 'Ramavarappadu Ring Road Interchange', city: 'Vijayawada', lat: 16.5186, lng: 80.6690, type: 'dropping', elevation: 30, desc: 'Vijayawada Eastern Entry Concourse' }
    ]
  },
  'Mumbai_Pune': {
    highwayName: 'Yashwantrao Chavan Mumbai-Pune Expressway',
    highwayCode: 'NE 1 / NH 48',
    roadType: '6-Lane High-Speed Concrete Expressway',
    tollCount: 2,
    intermediatePoints: [
      { name: 'Vashi Plaza Highway Boarding Station', city: 'Navi Mumbai', lat: 19.0771, lng: 72.9986, type: 'boarding', elevation: 12, desc: 'Key trans-harbor boarding station' },
      { name: 'Kalamboli Expressway Gateway', city: 'Panvel', lat: 18.9902, lng: 73.1168, type: 'waypoint', elevation: 24, desc: 'Start of 6-lane high-speed concrete expressway' },
      { name: 'Khalapur Toll Plaza & Food Mall', city: 'Khalapur', lat: 18.8286, lng: 73.2842, type: 'rest_stop', elevation: 75, desc: 'Expressway Food Plaza with McDonald\'s, Starbucks & restrooms', amenities: ['Food Mall', 'Restrooms', 'Fuel & EV', 'Medical Aid'] },
      { name: 'Khandala Ghat & Bhor Tunnel', city: 'Khandala', lat: 18.7610, lng: 73.3734, type: 'waypoint', elevation: 550, desc: 'Scenic Western Ghats mountain tunnels & panoramic views' },
      { name: 'Lonavala Hill Station Junction', city: 'Lonavala', lat: 18.7546, lng: 73.4062, type: 'waypoint', elevation: 625, desc: 'Peak elevation point of the expressway transit' },
      { name: 'Talegaon Expressway Toll Concourse', city: 'Talegaon', lat: 18.7328, lng: 73.6749, type: 'waypoint', elevation: 580, desc: 'Deccan plateau descent into Pune metropolitan area' },
      { name: 'Wakad Highway Bridge Flyover', city: 'Pune', lat: 18.5987, lng: 73.7656, type: 'dropping', elevation: 565, desc: 'IT Park / Hinjawadi passenger dropping point' }
    ]
  },
  'Bengaluru_Hyderabad': {
    highwayName: 'National Highway 44 (North-South Corridor)',
    highwayCode: 'NH 44',
    roadType: '4/6-Lane Access-Controlled Highway',
    tollCount: 6,
    intermediatePoints: [
      { name: 'Hebbal Flyover Expressway Exit', city: 'Bengaluru', lat: 13.0358, lng: 77.5970, type: 'boarding', elevation: 915, desc: 'North Bengaluru arterial exit' },
      { name: 'KIA Trumpet Interchange (Devanahalli)', city: 'Bengaluru', lat: 13.2389, lng: 77.7126, type: 'waypoint', elevation: 900, desc: 'International Airport access corridor' },
      { name: 'Chikkaballapur Bypass', city: 'Chikkaballapur', lat: 13.4325, lng: 77.7275, type: 'waypoint', elevation: 915, desc: 'Scenic Nandi Hills corridor' },
      { name: 'Anantapur Food Mall & Rest Zone', city: 'Anantapur', lat: 14.6819, lng: 77.6006, type: 'rest_stop', elevation: 335, desc: 'Highway mid-point refreshments, bio-toilets & restaurant', amenities: ['Restaurant', 'Coffee Kiosk', 'Clean Restrooms', 'Petrol Pump'] },
      { name: 'Kurnool Tungabhadra Bridge Junction', city: 'Kurnool', lat: 15.8281, lng: 78.0373, type: 'waypoint', elevation: 274, desc: 'Andhra-Telangana border transit over Tungabhadra River' },
      { name: 'Jadcherla Toll Plaza & Food Court', city: 'Jadcherla', lat: 16.7628, lng: 78.1402, type: 'rest_stop', elevation: 510, desc: 'Final passenger refreshment halt' },
      { name: 'Shamshabad Airport Approach Junction', city: 'Hyderabad', lat: 17.2403, lng: 78.4294, type: 'dropping', elevation: 550, desc: 'South Hyderabad passenger dropping terminal' }
    ]
  },
  'Chennai_Coimbatore': {
    highwayName: 'National Highway 544 & NH 48 Corridor',
    highwayCode: 'NH 544 / NH 48',
    roadType: '6-Lane Divided Carriageway',
    tollCount: 6,
    intermediatePoints: [
      { name: 'Koyambedu CMBT Highway Exit', city: 'Chennai', lat: 13.0694, lng: 80.2038, type: 'boarding', elevation: 16, desc: 'South India\'s largest transit concourse' },
      { name: 'Sriperumbudur Industrial Corridor', city: 'Sriperumbudur', lat: 12.9675, lng: 79.9404, type: 'waypoint', elevation: 37, desc: 'Automobile manufacturing belt expressway' },
      { name: 'Vellore Golden Temple Junction', city: 'Vellore', lat: 12.9165, lng: 79.1325, type: 'waypoint', elevation: 216, desc: 'Historic transit corridor along Palar River basin' },
      { name: 'Krishnagiri Highway Oasis Food Court', city: 'Krishnagiri', lat: 12.5186, lng: 78.2137, type: 'rest_stop', elevation: 490, desc: 'Famous South Indian tiffin, filter coffee & fresh amenities', amenities: ['Saravana Bhavan', 'Clean Washrooms', 'Coffee', 'Fuel'] },
      { name: 'Salem Steel City Interchange', city: 'Salem', lat: 11.6643, lng: 78.1460, type: 'waypoint', elevation: 278, desc: 'Key central Tamil Nadu highway junction' },
      { name: 'Erode Perundurai Bypass', city: 'Erode', lat: 11.2778, lng: 77.5878, type: 'waypoint', elevation: 230, desc: 'Bypass corridor with 6-lane smooth tarmac' },
      { name: 'Avinashi Road / Hope College Concourse', city: 'Coimbatore', lat: 11.0289, lng: 77.0142, type: 'dropping', elevation: 415, desc: 'Coimbatore eastern entrance terminal' }
    ]
  },
  'Delhi_Jaipur': {
    highwayName: 'Delhi-Mumbai Expressway & NH 48 (Pink City Expressway)',
    highwayCode: 'NE 4 / NH 48',
    roadType: '8-Lane Greenfield Access-Controlled Expressway',
    tollCount: 4,
    intermediatePoints: [
      { name: 'Dhaula Kuan / IFFCO Chowk Boarding Bay', city: 'Delhi / Gurgaon', lat: 28.4720, lng: 77.0726, type: 'boarding', elevation: 220, desc: 'Millennium City arterial boarding terminal' },
      { name: 'Manesar Industrial Expressway Interchange', city: 'Manesar', lat: 28.3588, lng: 76.9408, type: 'waypoint', elevation: 235, desc: 'High-speed 8-lane expressway access' },
      { name: 'Neemrana Japanese Zone Food Plaza', city: 'Neemrana', lat: 27.9888, lng: 76.3879, type: 'rest_stop', elevation: 310, desc: 'Midway Highway Oasis with food outlets, tea, and restrooms', amenities: ['Haldiram\'s', 'Costa Coffee', 'Restrooms', 'EV Charging'] },
      { name: 'Behror Midway Concourse', city: 'Behror', lat: 27.8920, lng: 76.2818, type: 'waypoint', elevation: 312, desc: 'Rajasthan border transit corridor' },
      { name: 'Kotputli Aravali Ridge Crossing', city: 'Kotputli', lat: 27.7037, lng: 76.2015, type: 'waypoint', elevation: 340, desc: 'Scenic passage flanked by ancient Aravali hill ranges' },
      { name: 'Shahpura Expressway Junction', city: 'Shahpura', lat: 27.3872, lng: 75.9610, type: 'waypoint', elevation: 365, desc: 'Final approach stretch towards Jaipur' },
      { name: 'Transport Nagar / Sindhi Camp Gateway', city: 'Jaipur', lat: 26.9015, lng: 75.8423, type: 'dropping', elevation: 425, desc: 'Jaipur City entry terminal and transit depot' }
    ]
  }
};

// Calculate geodesic distance between two points in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Generate complete highway route dataset for any city pair
export function generateRouteData(source: string, destination: string): RouteData {
  const src = source?.trim() || 'Visakhapatnam';
  const dst = destination?.trim() || 'Vijayawada';

  const pairKey1 = `${src}_${dst}`;
  const pairKey2 = `${dst}_${src}`;

  // Check if preset corridor exists
  if (PRESET_CORRIDORS[pairKey1]) {
    const preset = PRESET_CORRIDORS[pairKey1];
    const srcCoords = CITY_COORDINATES[src] || { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', elevation: 45 };
    const dstCoords = CITY_COORDINATES[dst] || { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh', elevation: 39 };

    const totalDist = calculateDistanceKm(srcCoords.lat, srcCoords.lng, dstCoords.lat, dstCoords.lng) * 1.22; // road factor
    const totalKm = Math.round(totalDist);

    const stops: RouteStop[] = [
      {
        id: 'stop-origin',
        name: `${src} Central RTC Terminal`,
        city: src,
        lat: srcCoords.lat,
        lng: srcCoords.lng,
        type: 'origin',
        distanceKm: 0,
        elevationMeters: srcCoords.elevation,
        timeOffsetMinutes: 0,
        description: `Origin Departure Terminal at ${src}`,
        amenities: ['AC Lounge', 'Ticket Concourse', 'Prepaid Taxi', 'Food Court', 'ATM']
      },
      ...preset.intermediatePoints.map((pt, idx) => {
        const progress = (idx + 1) / (preset.intermediatePoints.length + 1);
        return {
          id: `stop-mid-${idx + 1}`,
          name: pt.name,
          city: pt.city,
          lat: pt.lat,
          lng: pt.lng,
          type: pt.type,
          distanceKm: Math.round(totalKm * progress),
          elevationMeters: pt.elevation,
          timeOffsetMinutes: Math.round((totalKm * progress / 60) * 60),
          description: pt.desc,
          amenities: pt.amenities || ['Highway Shelter', 'Emergency SOS', 'Restrooms']
        };
      }),
      {
        id: 'stop-dest',
        name: `${dst} Central Bus Terminal`,
        city: dst,
        lat: dstCoords.lat,
        lng: dstCoords.lng,
        type: 'destination',
        distanceKm: totalKm,
        elevationMeters: dstCoords.elevation,
        timeOffsetMinutes: Math.round((totalKm / 55) * 60),
        description: `Final Arrival Terminal at ${dst}`,
        amenities: ['Arrival Concourse', 'Luggage Bay', 'Auto/Taxi Stand', 'Transit Helpdesk']
      }
    ];

    const elevationProfile = stops.map(s => ({
      km: s.distanceKm,
      elevation: s.elevationMeters,
      label: s.city
    }));

    const hours = Math.floor(totalKm / 55);
    const mins = Math.round(((totalKm / 55) % 1) * 60);

    return {
      highwayName: preset.highwayName,
      highwayCode: preset.highwayCode,
      totalDistanceKm: totalKm,
      estimatedDuration: `${hours}h ${mins}m`,
      roadType: preset.roadType,
      tollCount: preset.tollCount,
      restStopsCount: preset.intermediatePoints.filter(p => p.type === 'rest_stop').length || 1,
      safetyScore: 4.8,
      sourceCity: src,
      destCity: dst,
      stops,
      elevationProfile
    };
  }

  // Dynamic procedural corridor generation for any arbitrary city pair in India
  const srcCoords = CITY_COORDINATES[src] || { lat: 17.6868, lng: 83.2185, state: 'Origin State', elevation: 50 };
  const dstCoords = CITY_COORDINATES[dst] || { lat: 16.5062, lng: 80.6480, state: 'Destination State', elevation: 40 };

  const straightDist = calculateDistanceKm(srcCoords.lat, srcCoords.lng, dstCoords.lat, dstCoords.lng);
  const totalKm = Math.max(80, Math.round(straightDist * 1.25)); // realistic highway winding coefficient
  const highwayNum = Math.floor(10 + ((src.charCodeAt(0) + dst.charCodeAt(0)) % 60));

  const intermediateCount = totalKm > 500 ? 5 : totalKm > 250 ? 4 : 3;
  const stops: RouteStop[] = [];

  // Origin stop
  stops.push({
    id: 'stop-origin',
    name: `${src} Intercity Central Bus Station`,
    city: src,
    lat: srcCoords.lat,
    lng: srcCoords.lng,
    type: 'origin',
    distanceKm: 0,
    elevationMeters: srcCoords.elevation,
    timeOffsetMinutes: 0,
    description: `Primary departure concourse at ${src}`,
    amenities: ['Waiting Lounge', 'Restrooms', 'Information Counter', 'Tea/Snacks']
  });

  // Intermediate interpolated waypoints with slight curve deviation for natural curvature
  for (let i = 1; i <= intermediateCount; i++) {
    const fraction = i / (intermediateCount + 1);
    // Add sinusoidal deviation perpendicular to route line
    const deviation = Math.sin(fraction * Math.PI) * 0.15;
    const lat = srcCoords.lat + (dstCoords.lat - srcCoords.lat) * fraction + deviation * 0.4;
    const lng = srcCoords.lng + (dstCoords.lng - srcCoords.lng) * fraction - deviation * 0.3;
    
    const isRestStop = i === Math.ceil(intermediateCount / 2);
    const isBoarding = i === 1;
    const isDropping = i === intermediateCount;

    const stopType: RouteStop['type'] = isRestStop ? 'rest_stop' : isBoarding ? 'boarding' : isDropping ? 'dropping' : 'waypoint';
    const dist = Math.round(totalKm * fraction);
    const elev = Math.round(srcCoords.elevation + (dstCoords.elevation - srcCoords.elevation) * fraction + (isRestStop ? 45 : 15));

    stops.push({
      id: `stop-mid-${i}`,
      name: isRestStop 
        ? `Midway Highway Oasis Plaza (KM ${dist})` 
        : isBoarding 
          ? `${src} Expressway Ring Road Junction` 
          : isDropping 
            ? `${dst} Bypass Flyover Concourse` 
            : `NH-${highwayNum} Waypoint & Toll Plaza (KM ${dist})`,
      city: isBoarding ? src : isDropping ? dst : `Highway Corridor (KM ${dist})`,
      lat,
      lng,
      type: stopType,
      distanceKm: dist,
      elevationMeters: elev,
      timeOffsetMinutes: Math.round((dist / 55) * 60),
      description: isRestStop 
        ? 'Scheduled 20-minute refreshment and driver change halt' 
        : `Interstate highway transit checkpoint along NH-${highwayNum}`,
      amenities: isRestStop ? ['Food Plaza', 'Clean Restrooms', 'ATM', 'Fuel & EV Charging'] : ['Highway CCTV', 'Emergency SOS']
    });
  }

  // Destination stop
  stops.push({
    id: 'stop-dest',
    name: `${dst} Central Main Terminal`,
    city: dst,
    lat: dstCoords.lat,
    lng: dstCoords.lng,
    type: 'destination',
    distanceKm: totalKm,
    elevationMeters: dstCoords.elevation,
    timeOffsetMinutes: Math.round((totalKm / 55) * 60),
    description: `Final destination terminal at ${dst}`,
    amenities: ['Arrival Bay', 'Prepaid Taxi', 'Luggage Cloakroom', 'Public Transit Links']
  });

  const elevationProfile = stops.map(s => ({
    km: s.distanceKm,
    elevation: s.elevationMeters,
    label: s.city
  }));

  const hours = Math.floor(totalKm / 55);
  const mins = Math.round(((totalKm / 55) % 1) * 60);

  return {
    highwayName: `National Highway ${highwayNum} Express Corridor`,
    highwayCode: `NH ${highwayNum}`,
    totalDistanceKm: totalKm,
    estimatedDuration: `${hours}h ${mins}m`,
    roadType: '4-Lane National Divided Expressway',
    tollCount: Math.max(2, Math.floor(totalKm / 80)),
    restStopsCount: 1,
    safetyScore: 4.7,
    sourceCity: src,
    destCity: dst,
    stops,
    elevationProfile
  };
}
