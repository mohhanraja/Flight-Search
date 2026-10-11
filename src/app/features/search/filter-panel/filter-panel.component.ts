import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { FilterOptions, FlightFilters, SortOption } from '../../../core/models/flight.model';
import { defaultFilters } from '../../../core/utils/flight-filters';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanelComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) options!: FilterOptions;
  @Output() filtersChange = new EventEmitter<FlightFilters>();

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'price', label: 'Cheapest first' },
    { value: 'duration', label: 'Shortest first' },
    { value: 'departure', label: 'Earliest departure' },
  ];

  readonly stopOptions: { value: number | null; label: string }[] = [
    { value: null, label: 'Any' },
    { value: 0, label: 'Non-stop only' },
    { value: 1, label: 'Up to 1 stop' },
    { value: 2, label: 'Up to 2 stops' },
  ];

  readonly form = this.fb.nonNullable.group({
    maxPrice: 0,
    maxStops: this.fb.control<number | null>(null),
    airlines: this.fb.nonNullable.control<string[]>([]),
    sortBy: this.fb.nonNullable.control<SortOption>('price'),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(150), takeUntilDestroyed())
      .subscribe(() => this.filtersChange.emit(this.form.getRawValue()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // new results -> reset filters. don't emit, the parent resets its copy too
    if (changes['options']) {
      this.form.reset(defaultFilters(this.options), { emitEvent: false });
    }
  }

  setMaxPrice(event: Event): void {
    this.form.controls.maxPrice.setValue(Number((event.target as HTMLInputElement).value));
  }

  isAirlineSelected(airline: string): boolean {
    return this.form.controls.airlines.value.includes(airline);
  }

  toggleAirline(airline: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.controls.airlines.value;
    this.form.controls.airlines.setValue(
      checked ? [...current, airline] : current.filter((a) => a !== airline),
    );
  }

  clear(): void {
    this.form.reset(defaultFilters(this.options));
  }
}
