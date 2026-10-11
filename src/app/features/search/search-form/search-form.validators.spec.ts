import { FormControl, FormGroup } from '@angular/forms';
import {
  differentAirports,
  notInPast,
  returnNotBeforeDeparture,
  wholeNumber,
} from './search-form.validators';

describe('search form validators', () => {
  describe('notInPast', () => {
    it('rejects dates before today', () => {
      expect(notInPast(new FormControl('2000-01-01'))).toEqual({ pastDate: true });
    });

    it('accepts future dates', () => {
      expect(notInPast(new FormControl('2999-01-01'))).toBeNull();
    });

    it('ignores empty values (required handles those)', () => {
      expect(notInPast(new FormControl(''))).toBeNull();
    });
  });

  describe('wholeNumber', () => {
    it('rejects decimals', () => {
      expect(wholeNumber(new FormControl(1.5))).toEqual({ wholeNumber: true });
    });

    it('accepts integers and empty values', () => {
      expect(wholeNumber(new FormControl(3))).toBeNull();
      expect(wholeNumber(new FormControl(null))).toBeNull();
    });
  });

  describe('differentAirports', () => {
    const group = (from: string, to: string) => new FormGroup({ from: new FormControl(from), to: new FormControl(to) });

    it('flags identical airports', () => {
      expect(differentAirports(group('MAA', 'MAA'))).toEqual({ sameAirport: true });
    });

    it('passes different or not-yet-selected airports', () => {
      expect(differentAirports(group('MAA', 'DEL'))).toBeNull();
      expect(differentAirports(group('MAA', ''))).toBeNull();
    });
  });

  describe('returnNotBeforeDeparture', () => {
    const group = (departureDate: string, returnDate: string) =>
      new FormGroup({ departureDate: new FormControl(departureDate), returnDate: new FormControl(returnDate) });

    it('flags a return date before the departure date', () => {
      expect(returnNotBeforeDeparture(group('2030-05-10', '2030-05-09'))).toEqual({ returnBeforeDeparture: true });
    });

    it('allows same-day and later returns', () => {
      expect(returnNotBeforeDeparture(group('2030-05-10', '2030-05-10'))).toBeNull();
      expect(returnNotBeforeDeparture(group('2030-05-10', '2030-05-15'))).toBeNull();
    });

    it('treats the return date as optional', () => {
      expect(returnNotBeforeDeparture(group('2030-05-10', ''))).toBeNull();
    });
  });
});
