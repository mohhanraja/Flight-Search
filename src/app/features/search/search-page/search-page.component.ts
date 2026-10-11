import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { FlightSearchResponse, SearchParams } from '../../../core/models/flight.model';
import { FlightApiService } from '../../../core/services/flight-api.service';
import { Loadable, toLoadable } from '../../../core/utils/loadable';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SearchFormComponent } from '../search-form/search-form.component';
import { SearchResultsComponent } from '../search-results/search-results.component';

interface SearchState {
  params: SearchParams;
  result: Loadable<FlightSearchResponse>;
}

function parseSearchParams(query: ParamMap): SearchParams | null {
  const from = query.get('from');
  const to = query.get('to');
  const departureDate = query.get('departureDate');
  const passengers = Number(query.get('passengers') ?? 1);

  if (!from || !to || !departureDate || !Number.isInteger(passengers) || passengers < 1) {
    return null;
  }
  return { from, to, departureDate, returnDate: query.get('returnDate'), passengers };
}

const isSameSearch = (a: SearchParams | null, b: SearchParams | null) => JSON.stringify(a) === JSON.stringify(b);

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [AsyncPipe, SearchFormComponent, SearchResultsComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(FlightApiService);

  private readonly retry$ = new Subject<void>();

  readonly params$ = this.route.queryParamMap.pipe(map(parseSearchParams), distinctUntilChanged(isSameSearch));

  readonly state$ = this.params$.pipe(
    switchMap((params) => {
      if (!params) return of(null);

      return this.retry$.pipe(
        startWith(undefined),
        switchMap(() =>
          this.api.searchFlights(params).pipe(
            toLoadable(),
            map((result): SearchState => ({ params, result })),
          ),
        ),
      );
    }),
  );

  onSearch(params: SearchParams): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...params, returnDate: params.returnDate || null },
    });
  }

  retry(): void {
    this.retry$.next();
  }
}
