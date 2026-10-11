import { Flight } from '../core/models/flight.model';

export function makeFlight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: 'MAA-DEL-2030-01-10-1',
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E 512',
    from: 'MAA',
    to: 'DEL',
    departureTime: '2030-01-10T06:20:00',
    arrivalTime: '2030-01-10T09:10:00',
    durationMinutes: 170,
    stops: 0,
    stopovers: [],
    layoverMinutes: [],
    price: 10350,
    currency: 'INR',
    fare: { baseFare: 8487, taxesAndFees: 1863 },
    aircraft: 'Airbus A320neo',
    cabinBaggageKg: 7,
    checkInBaggageKg: 15,
    mealIncluded: false,
    refundable: true,
    seatsLeft: 6,
    ...overrides,
  };
}
