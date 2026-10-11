import { Observable, catchError, map, of, startWith } from 'rxjs';
import { getErrorMessage } from './error-message';

export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function toLoadable<T>() {
  return (source$: Observable<T>): Observable<Loadable<T>> =>
    source$.pipe(
      map((data): Loadable<T> => ({ status: 'success', data })),
      startWith<Loadable<T>>({ status: 'loading' }),
      catchError((err) => of<Loadable<T>>({ status: 'error', message: getErrorMessage(err) })),
    );
}
