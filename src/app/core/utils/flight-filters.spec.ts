import { makeFlight } from '../../testing/flight.fixture';
import { applyFilters, defaultFilters, getFilterOptions } from './flight-filters';

describe('flight filters', () => {
  const flights = [
    makeFlight({ id: 'a', airline: 'IndiGo', price: 4200, stops: 0, durationMinutes: 150, departureTime: '2030-01-10T09:00:00' }),
    makeFlight({ id: 'b', airline: 'Air India', price: 5100, stops: 1, durationMinutes: 300, departureTime: '2030-01-10T06:00:00' }),
    makeFlight({ id: 'c', airline: 'SpiceJet', price: 3550, stops: 2, durationMinutes: 420, departureTime: '2030-01-10T21:30:00' }),
  ];

  const ids = (list: { id: string }[]) => list.map((f) => f.id);

  describe('getFilterOptions', () => {
    it('rounds the price range outwards and lists airlines alphabetically', () => {
      expect(getFilterOptions(flights)).toEqual({
        minPrice: 3500,
        maxPrice: 5100,
        airlines: ['Air India', 'IndiGo', 'SpiceJet'],
      });
    });

    it('copes with an empty list', () => {
      expect(getFilterOptions([])).toEqual({ minPrice: 0, maxPrice: 0, airlines: [] });
    });
  });

  describe('applyFilters', () => {
    const defaults = defaultFilters(getFilterOptions(flights));

    it('returns everything, cheapest first, with the default filters', () => {
      expect(ids(applyFilters(flights, defaults))).toEqual(['c', 'a', 'b']);
    });

    it('filters by max price', () => {
      expect(ids(applyFilters(flights, { ...defaults, maxPrice: 4200 }))).toEqual(['c', 'a']);
    });

    it('filters by max stops', () => {
      expect(ids(applyFilters(flights, { ...defaults, maxStops: 0 }))).toEqual(['a']);
      expect(ids(applyFilters(flights, { ...defaults, maxStops: 1 }))).toEqual(['a', 'b']);
    });

    it('filters by airline', () => {
      expect(ids(applyFilters(flights, { ...defaults, airlines: ['Air India', 'SpiceJet'] }))).toEqual(['c', 'b']);
    });

    it('combines several filters', () => {
      const result = applyFilters(flights, { ...defaults, maxStops: 1, airlines: ['Air India'] });
      expect(ids(result)).toEqual(['b']);
    });

    it('sorts by duration and by departure time', () => {
      expect(ids(applyFilters(flights, { ...defaults, sortBy: 'duration' }))).toEqual(['a', 'b', 'c']);
      expect(ids(applyFilters(flights, { ...defaults, sortBy: 'departure' }))).toEqual(['b', 'a', 'c']);
    });

    it('does not mutate the original list', () => {
      const before = ids(flights);
      applyFilters(flights, { ...defaults, sortBy: 'duration' });
      expect(ids(flights)).toEqual(before);
    });
  });
});
