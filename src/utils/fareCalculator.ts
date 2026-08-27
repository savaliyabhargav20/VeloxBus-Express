/**
 * Dynamic Bus Fare Calculation Module
 * 
 * Automatically calculates dynamic bus fares based on:
 * 1. Day of the week (from selected travel date)
 * 2. Seat availability percentage (demand pricing)
 * 3. Number of passengers
 */

export interface FareCalculationInput {
  baseFare: number;
  travelDate: string | Date;
  availableSeats: number;
  totalSeats: number;
  passengers?: number;
}

export interface FareBreakdown {
  dayName: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  dayAdjustmentPercentage: number;
  availabilityPercentage: number;
  demandAdjustmentPercentage: number;
  baseFarePerPassenger: number;
  adjustedFarePerPassenger: number;
  passengerCount: number;
  totalFare: number;
}

/**
 * Returns day-of-week multiplier adjustment percentage based on pricing rules:
 * - Monday: Base fare (0%)
 * - Tuesday: -5%
 * - Wednesday: -5%
 * - Thursday: Base fare (0%)
 * - Friday: +5%
 * - Saturday: +15%
 * - Sunday: +20%
 */
export function getDayAdjustmentPercentage(dayIndex: number): number {
  switch (dayIndex) {
    case 0: // Sunday
      return 20;
    case 1: // Monday
      return 0;
    case 2: // Tuesday
      return -5;
    case 3: // Wednesday
      return -5;
    case 4: // Thursday
      return 0;
    case 5: // Friday
      return 5;
    case 6: // Saturday
      return 15;
    default:
      return 0;
  }
}

/**
 * Returns demand surge adjustment percentage based on seat availability:
 * - More than 60% seats available: No extra charge (0%)
 * - 40%–60% seats available: +10%
 * - 20%–39.99% seats available: +20%
 * - Less than 20% seats available: +30%
 */
export function getSeatAvailabilityAdjustmentPercentage(availableSeats: number, totalSeats: number): {
  availabilityPercentage: number;
  adjustmentPercentage: number;
} {
  if (totalSeats <= 0) {
    return { availabilityPercentage: 100, adjustmentPercentage: 0 };
  }

  const availabilityPercentage = (availableSeats / totalSeats) * 100;

  let adjustmentPercentage = 0;
  if (availabilityPercentage > 60) {
    adjustmentPercentage = 0;
  } else if (availabilityPercentage >= 40) {
    adjustmentPercentage = 10;
  } else if (availabilityPercentage >= 20) {
    adjustmentPercentage = 20;
  } else {
    adjustmentPercentage = 30;
  }

  return {
    availabilityPercentage: Number(availabilityPercentage.toFixed(2)),
    adjustmentPercentage
  };
}

/**
 * Parse date string or Date object safely without timezone offset issues
 */
export function parseTravelDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return dateInput;
  }

  // Handle YYYY-MM-DD strings explicitly to avoid UTC midnight timezone rollover
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [year, month, day] = dateInput.trim().split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid travel date supplied: ${dateInput}`);
  }
  return parsed;
}

const DAY_NAMES: FareBreakdown['dayName'][] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Calculates dynamic bus fare with detailed audit breakdown.
 * 
 * Formula:
 * 1. Day-adjusted fare = baseFare * (1 + dayAdjustment / 100)
 * 2. Final per-passenger fare = Day-adjusted fare * (1 + demandAdjustment / 100)
 * 3. Total fare = Final per-passenger fare * passengerCount
 * 4. Rounded to 2 decimal places
 */
export function calculateDynamicFare(input: FareCalculationInput): FareBreakdown {
  const {
    baseFare,
    travelDate,
    availableSeats,
    totalSeats,
    passengers = 1
  } = input;

  if (baseFare < 0) {
    throw new Error('Base fare cannot be negative.');
  }

  const passengerCount = Math.max(1, passengers);

  // 1. Detect Day of the week
  const dateObj = parseTravelDate(travelDate);
  const dayIndex = dateObj.getDay(); // 0 (Sun) - 6 (Sat)
  const dayName = DAY_NAMES[dayIndex];

  // 2. Day-based fare adjustment
  const dayAdjustmentPercentage = getDayAdjustmentPercentage(dayIndex);
  const dayAdjustedFare = baseFare * (1 + dayAdjustmentPercentage / 100);

  // 3. Seat-availability adjustment
  const { availabilityPercentage, adjustmentPercentage: demandAdjustmentPercentage } =
    getSeatAvailabilityAdjustmentPercentage(availableSeats, totalSeats);

  const finalPerPassengerFare = dayAdjustedFare * (1 + demandAdjustmentPercentage / 100);

  // 4. Calculate total for all passengers
  const rawTotalFare = finalPerPassengerFare * passengerCount;

  return {
    dayName,
    dayAdjustmentPercentage,
    availabilityPercentage,
    demandAdjustmentPercentage,
    baseFarePerPassenger: Number(baseFare.toFixed(2)),
    adjustedFarePerPassenger: Number(finalPerPassengerFare.toFixed(2)),
    passengerCount,
    totalFare: Number(rawTotalFare.toFixed(2))
  };
}

/**
 * Convenience helper that returns only the final total fare number (rounded to 2 decimal places)
 */
export function getCalculatedFare(
  baseFare: number,
  travelDate: string | Date,
  availableSeats: number,
  totalSeats: number,
  passengers: number = 1
): number {
  const breakdown = calculateDynamicFare({
    baseFare,
    travelDate,
    availableSeats,
    totalSeats,
    passengers
  });
  return breakdown.totalFare;
}
