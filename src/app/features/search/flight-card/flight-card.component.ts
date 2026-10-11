import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Flight } from '../../../core/models/flight.model';
import { arrivalDayOffset } from '../../../core/utils/date-utils';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { StopsPipe } from '../../../shared/pipes/stops.pipe';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, DurationPipe, StopsPipe],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightCardComponent {
  @Input({ required: true }) flight!: Flight;
  @Input() passengers = 1;

  get dayOffset(): number {
    return arrivalDayOffset(this.flight.departureTime, this.flight.arrivalTime);
  }
}
