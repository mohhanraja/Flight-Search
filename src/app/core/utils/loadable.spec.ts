import { of, throwError, toArray } from 'rxjs';
import { ApiError } from './error-message';
import { Loadable, toLoadable } from './loadable';

describe('toLoadable', () => {
  it('emits loading and then the data', (done) => {
    of(42)
      .pipe(toLoadable(), toArray())
      .subscribe((states) => {
        expect(states).toEqual([{ status: 'loading' }, { status: 'success', data: 42 }]);
        done();
      });
  });

  it('turns an ApiError into an error state with its message', (done) => {
    throwError(() => new ApiError('Nope', 400))
      .pipe(toLoadable<number>(), toArray())
      .subscribe((states: Loadable<number>[]) => {
        expect(states).toEqual([{ status: 'loading' }, { status: 'error', message: 'Nope' }]);
        done();
      });
  });

  it('uses a generic message for unknown errors', (done) => {
    throwError(() => new Error('boom'))
      .pipe(toLoadable<number>(), toArray())
      .subscribe((states) => {
        const last = states[states.length - 1];
        expect(last.status).toBe('error');
        done();
      });
  });
});
