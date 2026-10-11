import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FilterOptions, FlightFilters } from '../../../core/models/flight.model';
import { FilterPanelComponent } from './filter-panel.component';

describe('FilterPanelComponent', () => {
  let fixture: ComponentFixture<FilterPanelComponent>;
  let component: FilterPanelComponent;
  let emitted: FlightFilters[];

  const options: FilterOptions = { minPrice: 3500, maxPrice: 9000, airlines: ['Air India', 'IndiGo'] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilterPanelComponent] }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.filtersChange.subscribe((filters) => emitted.push(filters));

    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
  });

  it('starts with the default filters for the given options', () => {
    expect(component.form.getRawValue()).toEqual({
      maxPrice: 9000,
      maxStops: null,
      airlines: [],
      sortBy: 'price',
    });
  });

  it('renders a checkbox for every airline', () => {
    const boxes = (fixture.nativeElement as HTMLElement).querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBe(2);
  });

  it('emits the changed filters after the debounce', fakeAsync(() => {
    component.form.controls.maxStops.setValue(0);
    tick(100);
    expect(emitted.length).toBe(0);

    tick(100);
    expect(emitted.length).toBe(1);
    expect(emitted[0].maxStops).toBe(0);
  }));

  it('collapses rapid changes into one emission', fakeAsync(() => {
    component.form.controls.maxPrice.setValue(8000);
    component.form.controls.maxPrice.setValue(7000);
    component.form.controls.maxPrice.setValue(6000);
    tick(200);

    expect(emitted.length).toBe(1);
    expect(emitted[0].maxPrice).toBe(6000);
  }));

  it('adds and removes airlines from the selection', () => {
    const check = (checked: boolean) => ({ target: { checked } }) as unknown as Event;

    component.toggleAirline('IndiGo', check(true));
    expect(component.form.controls.airlines.value).toEqual(['IndiGo']);
    expect(component.isAirlineSelected('IndiGo')).toBe(true);

    component.toggleAirline('IndiGo', check(false));
    expect(component.form.controls.airlines.value).toEqual([]);
  });

  it('resets the form quietly when new options arrive', fakeAsync(() => {
    component.form.controls.maxStops.setValue(1);
    tick(200);
    emitted.length = 0;

    fixture.componentRef.setInput('options', { minPrice: 5000, maxPrice: 12000, airlines: ['SpiceJet'] });
    fixture.detectChanges();
    tick(200);

    expect(component.form.getRawValue().maxPrice).toBe(12000);
    expect(component.form.getRawValue().maxStops).toBeNull();
    expect(emitted.length).toBe(0);
  }));

  it('clears everything back to the defaults', fakeAsync(() => {
    component.form.patchValue({ maxPrice: 5000, maxStops: 0, sortBy: 'duration' });
    tick(200);
    emitted.length = 0;

    component.clear();
    tick(200);

    expect(emitted[0]).toEqual({ maxPrice: 9000, maxStops: null, airlines: [], sortBy: 'price' });
  }));
});
