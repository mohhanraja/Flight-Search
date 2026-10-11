import { FilterOptions, Flight, FlightFilters, SortOption } from '../models/flight.model';

const PRICE_STEP = 100;

export function getFilterOptions(flights: Flight[]): FilterOptions {
  if (!flights.length) {
    return { minPrice: 0, maxPrice: 0, airlines: [] };
  }
  const prices = flights.map((f) => f.price);
  return {
    minPrice: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
    maxPrice: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
    airlines: [...new Set(flights.map((f) => f.airline))].sort(),
  };
}

export function defaultFilters(options: FilterOptions): FlightFilters {
  return { maxPrice: options.maxPrice, maxStops: null, airlines: [], sortBy: 'price' };
}

const sorters: Record<SortOption, (a: Flight, b: Flight) => number> = {
  price: (a, b) => a.price - b.price,
  duration: (a, b) => a.durationMinutes - b.durationMinutes,
  departure: (a, b) => a.departureTime.localeCompare(b.departureTime),
};

export function applyFilters(flights: Flight[], filters: FlightFilters): Flight[] {
  return flights
    .filter((f) => f.price <= filters.maxPrice)
    .filter((f) => filters.maxStops === null || f.stops <= filters.maxStops)
    .filter((f) => !filters.airlines.length || filters.airlines.includes(f.airline))
    .sort(sorters[filters.sortBy]);
}
