export interface Fare {
  baseFare: number;
  taxesAndFees: number;
}

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string; // local time at origin, e.g. 2026-10-20T06:20:00
  arrivalTime: string; // local time at destination
  durationMinutes: number;
  stops: number;
  stopovers: string[];
  layoverMinutes: number[];
  price: number; // per passenger
  currency: string;
  fare: Fare;
  aircraft: string;
  cabinBaggageKg: number;
  checkInBaggageKg: number;
  mealIncluded: boolean;
  refundable: boolean;
  seatsLeft: number;
}

export interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
}

export interface FlightSearchResponse {
  outbound: Flight[];
  inbound: Flight[] | null;
}

export type SortOption = 'price' | 'duration' | 'departure';

export interface FlightFilters {
  maxPrice: number;
  maxStops: number | null; // null = any
  airlines: string[]; // empty = all
  sortBy: SortOption;
}

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  airlines: string[];
}
