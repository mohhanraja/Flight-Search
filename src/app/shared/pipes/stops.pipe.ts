import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stops', standalone: true })
export class StopsPipe implements PipeTransform {
  transform(stops: number): string {
    if (stops === 0) return 'Non-stop';
    return stops === 1 ? '1 stop' : `${stops} stops`;
  }
}
