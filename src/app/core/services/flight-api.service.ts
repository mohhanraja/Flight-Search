import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, shareReplay, timeout } from 'rxjs';
import { Airport } from '../models/airport.model';
import { Flight, FlightSearchResponse, SearchParams } from '../models/flight.model';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

const REQUEST_TIMEOUT_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class FlightApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private airports$?: Observable<Airport[]>;

  // airports don't change, fetch once and reuse
  getAirports(): Observable<Airport[]> {
    this.airports$ ??= this.http
      .get<Airport[]>(`${this.baseUrl}/airports`)
      .pipe(timeout(REQUEST_TIMEOUT_MS), shareReplay({ bufferSize: 1, refCount: false }));
    return this.airports$;
  }

  searchFlights(search: SearchParams): Observable<FlightSearchResponse> {
    let params = new HttpParams()
      .set('from', search.from)
      .set('to', search.to)
      .set('departureDate', search.departureDate)
      .set('passengers', search.passengers);

    if (search.returnDate) {
      params = params.set('returnDate', search.returnDate);
    }

    return this.http
      .get<FlightSearchResponse>(`${this.baseUrl}/flights`, { params })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  getFlight(id: string): Observable<Flight> {
    return this.http
      .get<Flight>(`${this.baseUrl}/flights/${encodeURIComponent(id)}`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
