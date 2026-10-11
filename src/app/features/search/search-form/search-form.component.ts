import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { SearchParams } from '../../../core/models/flight.model';
import { FlightApiService } from '../../../core/services/flight-api.service';
import { todayString } from '../../../core/utils/date-utils';
import { toLoadable } from '../../../core/utils/loadable';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import {
  differentAirports,
  notInPast,
  returnNotBeforeDeparture,
  wholeNumber,
} from './search-form.validators';

type ControlName = 'from' | 'to' | 'departureDate' | 'returnDate' | 'passengers';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(FlightApiService);

  @Output() search = new EventEmitter<SearchParams>();

  @Input() set value(params: SearchParams | null) {
    if (params) {
      this.form.patchValue({ ...params, returnDate: params.returnDate ?? '' }, { emitEvent: false });
    }
  }

  readonly today = todayString();

  readonly form = this.fb.nonNullable.group(
    {
      from: ['', Validators.required],
      to: ['', Validators.required],
      departureDate: ['', [Validators.required, notInPast]],
      returnDate: ['', notInPast],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(9), wholeNumber]],
    },
    { validators: [differentAirports, returnNotBeforeDeparture] },
  );

  private readonly reloadAirports$ = new BehaviorSubject<void>(undefined);
  readonly airports$ = this.reloadAirports$.pipe(switchMap(() => this.api.getAirports().pipe(toLoadable())));

  get returnMinDate(): string {
    return this.form.controls.departureDate.value || this.today;
  }

  reloadAirports(): void {
    this.reloadAirports$.next();
  }

  swapAirports(): void {
    const { from, to } = this.form.getRawValue();
    this.form.patchValue({ from: to, to: from });
  }

  hasError(name: ControlName, error: string): boolean {
    const control = this.form.controls[name];
    return control.touched && control.hasError(error);
  }

  isInvalid(name: ControlName): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { from, to, departureDate, returnDate, passengers } = this.form.getRawValue();
    this.search.emit({
      from,
      to,
      departureDate,
      returnDate: returnDate || null,
      passengers,
    });
  }
}
