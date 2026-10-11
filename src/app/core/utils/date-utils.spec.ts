import { arrivalDayOffset, todayString } from './date-utils';

describe('date utils', () => {
  describe('arrivalDayOffset', () => {
    it('is 0 for a same-day arrival', () => {
      expect(arrivalDayOffset('2030-01-10T06:20:00', '2030-01-10T09:10:00')).toBe(0);
    });

    it('is 1 when the flight lands the next day', () => {
      expect(arrivalDayOffset('2030-01-10T23:10:00', '2030-01-11T01:40:00')).toBe(1);
    });

    it('works across month boundaries', () => {
      expect(arrivalDayOffset('2030-01-31T22:00:00', '2030-02-01T02:00:00')).toBe(1);
    });
  });

  describe('todayString', () => {
    it('returns a yyyy-MM-dd string', () => {
      expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
