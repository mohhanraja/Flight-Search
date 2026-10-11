import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from '../utils/error-message';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function failWith(status: number, body: object | null = null): ApiError {
    let caught!: ApiError;
    client.get('/api/test').subscribe({ error: (err) => (caught = err) });
    http.expectOne('/api/test').flush(body, { status, statusText: 'error' });
    return caught;
  }

  it('uses the message sent by the API for 400 responses', () => {
    const err = failWith(400, { message: 'Origin and destination must be different' });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Origin and destination must be different');
    expect(err.status).toBe(400);
  });

  it('falls back to a default message when the API sends none', () => {
    expect(failWith(404).message).toContain('could not find');
  });

  it('hides server error details behind a friendly message', () => {
    const err = failWith(500, { message: 'stack trace here' });
    expect(err.message).not.toContain('stack trace');
    expect(err.status).toBe(500);
  });

  it('reports an unreachable server', () => {
    let caught!: ApiError;
    client.get('/api/test').subscribe({ error: (err) => (caught = err) });
    http.expectOne('/api/test').error(new ProgressEvent('error'));
    expect(caught.status).toBe(0);
    expect(caught.message).toContain('Cannot reach');
  });
});
