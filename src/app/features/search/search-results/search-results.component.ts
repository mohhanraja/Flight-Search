import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, startWith, switchMap } from 'rxjs';
import {
  FilterOptions,
  Flight,
  FlightFilters,
  FlightSearchResponse,
  SearchParams,
} from '../../../core/models/flight.model';
import { applyFilters, defaultFilters, getFilterOptions } from '../../../core/utils/flight-filters';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { FlightCardComponent } from '../flight-card/flight-card.component';

type Leg = 'outbound' | 'inbound';

interface ResultsView {
  options: FilterOptions;
  total: number;
  flights: Flight[];
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FilterPanelComponent, FlightCardComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit {
  @Input({ required: true }) response!: FlightSearchResponse;
  @Input({ required: true }) params!: SearchParams;

  private readonly leg$ = new BehaviorSubject<Leg>('outbound');
  private readonly filterChange$ = new Subject<FlightFilters>();

  readonly activeLeg$ = this.leg$.asObservable();
  view$!: Observable<ResultsView>;

  ngOnInit(): void {
    this.view$ = this.leg$.pipe(
      map((leg) => (leg === 'outbound' ? this.response.outbound : (this.response.inbound ?? []))),
      // switching leg resets the filters
      switchMap((flights) => {
        const options = getFilterOptions(flights);
        return this.filterChange$.pipe(
          startWith(defaultFilters(options)),
          map((filters) => ({
            options,
            total: flights.length,
            flights: applyFilters(flights, filters),
          })),
        );
      }),
    );
  }

  selectLeg(leg: Leg): void {
    this.leg$.next(leg);
  }

  onFiltersChange(filters: FlightFilters): void {
    this.filterChange$.next(filters);
  }
}
