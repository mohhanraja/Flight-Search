import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats hours and minutes', () => {
    expect(pipe.transform(170)).toBe('2h 50m');
  });

  it('drops the minutes when the duration is a whole number of hours', () => {
    expect(pipe.transform(120)).toBe('2h');
  });

  it('shows only minutes for short durations', () => {
    expect(pipe.transform(45)).toBe('45m');
  });
});
