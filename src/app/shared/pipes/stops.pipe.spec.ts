import { StopsPipe } from './stops.pipe';

describe('StopsPipe', () => {
  const pipe = new StopsPipe();

  it('labels direct flights as non-stop', () => {
    expect(pipe.transform(0)).toBe('Non-stop');
  });

  it('uses the singular for one stop', () => {
    expect(pipe.transform(1)).toBe('1 stop');
  });

  it('uses the plural for several stops', () => {
    expect(pipe.transform(2)).toBe('2 stops');
  });
});
