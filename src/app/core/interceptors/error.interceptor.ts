import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../utils/error-message';

function toApiError(err: unknown): unknown {
  if (!(err instanceof HttpErrorResponse)) {
    return err;
  }

  // the API sends { message } for 4xx errors
  const serverMessage: string | undefined = err.error?.message;

  if (err.status === 0) {
    return new ApiError(
      'Cannot reach the flight service. Check your connection and make sure the API server is running.',
      0,
    );
  }
  if (err.status === 400) {
    return new ApiError(serverMessage ?? 'The search request was not valid.', err.status);
  }
  if (err.status === 404) {
    return new ApiError(serverMessage ?? 'We could not find what you were looking for.', err.status);
  }
  if (err.status >= 500) {
    return new ApiError('The flight service ran into a problem. Please try again in a moment.', err.status);
  }
  return new ApiError('Something went wrong. Please try again.', err.status);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((err) => throwError(() => toApiError(err))));
