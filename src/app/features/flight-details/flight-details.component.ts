import { AsyncPipe, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { FlightApiService } from '../../core/services/flight-api.service';
import { arrivalDayOffset } from '../../core/utils/date-utils';
import { toLoadable } from '../../core/utils/loadable';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { StopsPipe } from '../../shared/pipes/stops.pipe';

@Component({
  selector: 'app-flight-details',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    DurationPipe,
    StopsPipe,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './flight-details.component.html',
  styleUrl: './flight-details.component.scss',
})
export class FlightDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly api = inject(FlightApiService);

  private readonly retry$ = new Subject<void>();

  // opened directly (link / refresh) -> no history to go back to
  readonly canGoBack = !!this.router.getCurrentNavigation()?.previousNavigation;

  private readonly flight$ = combineLatest([
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      distinctUntilChanged(),
    ),
    this.retry$.pipe(startWith(undefined)),
  ]).pipe(switchMap(([id]) => this.api.getFlight(id).pipe(toLoadable())));

  private readonly passengers$ = this.route.queryParamMap.pipe(
    map((query) => Number(query.get('passengers'))),
    map((count) => (Number.isInteger(count) && count >= 1 ? count : 1)),
  );

  // only for city names, the page should still work if this fails
  private readonly cities$ = this.api.getAirports().pipe(
    map((airports) => new Map(airports.map((a) => [a.code, a.city]))),
    catchError(() => of(new Map<string, string>())),
  );

  readonly view$ = combineLatest([this.flight$, this.passengers$, this.cities$]).pipe(
    map(([state, passengers, cities]) => ({ state, passengers, cities })),
  );

  dayOffset(departure: string, arrival: string): number {
    return arrivalDayOffset(departure, arrival);
  }

  goBack(): void {
    this.location.back();
  }

  retry(): void {
    this.retry$.next();
  }
}
