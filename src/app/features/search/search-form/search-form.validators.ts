import { AbstractControl, ValidationErrors } from '@angular/forms';
import { todayString } from '../../../core/utils/date-utils';

export function notInPast(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  return value && value < todayString() ? { pastDate: true } : null;
}

export function wholeNumber(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') return null;
  return Number.isInteger(value) ? null : { wholeNumber: true };
}

export function differentAirports(group: AbstractControl): ValidationErrors | null {
  const from = group.get('from')?.value;
  const to = group.get('to')?.value;
  return from && to && from === to ? { sameAirport: true } : null;
}

export function returnNotBeforeDeparture(group: AbstractControl): ValidationErrors | null {
  const departure = group.get('departureDate')?.value;
  const back = group.get('returnDate')?.value;
  return departure && back && back < departure ? { returnBeforeDeparture: true } : null;
}
