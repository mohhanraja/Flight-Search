import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { makeFlight } from '../../../testing/flight.fixture';
import { FlightCardComponent } from './flight-card.component';

describe('FlightCardComponent', () => {
  let fixture: ComponentFixture<FlightCardComponent>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  function render(inputs: { flight: ReturnType<typeof makeFlight>; passengers?: number }) {
    fixture.componentRef.setInput('flight', inputs.flight);
    if (inputs.passengers) fixture.componentRef.setInput('passengers', inputs.passengers);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(FlightCardComponent);
  });

  it('shows the key flight information', () => {
    render({ flight: makeFlight() });

    expect(text()).toContain('IndiGo');
    expect(text()).toContain('6E 512');
    expect(text()).toContain('06:20');
    expect(text()).toContain('09:10');
    expect(text()).toContain('2h 50m');
    expect(text()).toContain('Non-stop');
    expect(text()).toContain('10,350');
  });

  it('lists the stopovers for connecting flights', () => {
    render({ flight: makeFlight({ stops: 1, stopovers: ['BLR'] }) });

    expect(text()).toContain('1 stop');
    expect(text()).toContain('BLR');
  });

  it('marks next-day arrivals', () => {
    render({
      flight: makeFlight({ departureTime: '2030-01-10T23:30:00', arrivalTime: '2030-01-11T02:10:00' }),
    });

    expect(text()).toContain('+1');
  });

  it('shows the group total only when travelling with more than one passenger', () => {
    render({ flight: makeFlight() });
    expect(text()).not.toContain('for 1');

    render({ flight: makeFlight(), passengers: 3 });
    expect(text()).toContain('31,050');
    expect(text()).toContain('for 3');
  });

  it('links to the flight details page', () => {
    render({ flight: makeFlight(), passengers: 2 });

    const link = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(link?.getAttribute('href')).toBe('/flights/MAA-DEL-2030-01-10-1?passengers=2');
  });
});
