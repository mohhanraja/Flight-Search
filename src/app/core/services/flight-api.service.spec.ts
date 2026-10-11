import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { makeFlight } from '../../testing/flight.fixture';
import { SearchParams } from '../models/flight.model';
import { FlightApiService } from './flight-api.service';

describe('FlightApiService', () => {
  let service: FlightApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FlightApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the search criteria as query params', () => {
    const search: SearchParams = {
      from: 'MAA',
      to: 'DEL',
      departureDate: '2030-01-10',
      returnDate: '2030-01-15',
      passengers: 2,
    };

    service.searchFlights(search).subscribe();

    const req = http.expectOne((r) => r.url === '/api/flights');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe('MAA');
    expect(req.request.params.get('to')).toBe('DEL');
    expect(req.request.params.get('departureDate')).toBe('2030-01-10');
    expect(req.request.params.get('returnDate')).toBe('2030-01-15');
    expect(req.request.params.get('passengers')).toBe('2');
    req.flush({ outbound: [], inbound: [] });
  });

  it('leaves out returnDate for one-way searches', () => {
    service
      .searchFlights({ from: 'MAA', to: 'DEL', departureDate: '2030-01-10', returnDate: null, passengers: 1 })
      .subscribe();

    const req = http.expectOne((r) => r.url === '/api/flights');
    expect(req.request.params.has('returnDate')).toBe(false);
    req.flush({ outbound: [], inbound: null });
  });

  it('returns the search response body', (done) => {
    const flight = makeFlight();

    service
      .searchFlights({ from: 'MAA', to: 'DEL', departureDate: '2030-01-10', returnDate: null, passengers: 1 })
      .subscribe((response) => {
        expect(response.outbound).toEqual([flight]);
        expect(response.inbound).toBeNull();
        done();
      });

    http.expectOne((r) => r.url === '/api/flights').flush({ outbound: [flight], inbound: null });
  });

  it('loads a single flight by id', () => {
    service.getFlight('MAA-DEL-2030-01-10-1').subscribe();
    const req = http.expectOne('/api/flights/MAA-DEL-2030-01-10-1');
    expect(req.request.method).toBe('GET');
    req.flush(makeFlight());
  });

  it('only requests the airport list once', () => {
    service.getAirports().subscribe();
    service.getAirports().subscribe();

    http.expectOne('/api/airports').flush([{ code: 'MAA', city: 'Chennai', name: 'Chennai Airport', country: 'India' }]);
  });
});
