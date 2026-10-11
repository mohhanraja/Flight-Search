import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchParams } from '../../../core/models/flight.model';
import { SearchFormComponent } from './search-form.component';

describe('SearchFormComponent', () => {
  let fixture: ComponentFixture<SearchFormComponent>;
  let component: SearchFormComponent;
  let http: HttpTestingController;
  let emitted: SearchParams[];

  const airports = [
    { code: 'MAA', city: 'Chennai', name: 'Chennai Airport', country: 'India' },
    { code: 'DEL', city: 'Delhi', name: 'Delhi Airport', country: 'India' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SearchFormComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.search.subscribe((params) => emitted.push(params));

    fixture.detectChanges();
    http.expectOne('/api/airports').flush(airports);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  const validValues = () => ({
    from: 'MAA',
    to: 'DEL',
    departureDate: '2999-03-10',
    returnDate: '',
    passengers: 2,
  });

  it('renders the airports returned by the API', () => {
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('#from option');
    // placeholder + 2 airports
    expect(options.length).toBe(3);
  });

  it('does not emit and marks fields as touched when the form is empty', () => {
    component.submit();

    expect(emitted.length).toBe(0);
    expect(component.form.controls.from.touched).toBe(true);
    expect(component.hasError('from', 'required')).toBe(true);
  });

  it('is invalid when origin and destination are the same', () => {
    component.form.patchValue({ ...validValues(), to: 'MAA' });

    expect(component.form.hasError('sameAirport')).toBe(true);
    component.submit();
    expect(emitted.length).toBe(0);
  });

  it('is invalid when the return date is before the departure date', () => {
    component.form.patchValue({ ...validValues(), returnDate: '2999-03-01' });

    expect(component.form.hasError('returnBeforeDeparture')).toBe(true);
  });

  it('rejects passenger counts outside 1-9', () => {
    component.form.patchValue({ ...validValues(), passengers: 0 });
    expect(component.form.controls.passengers.hasError('min')).toBe(true);

    component.form.patchValue({ passengers: 10 });
    expect(component.form.controls.passengers.hasError('max')).toBe(true);
  });

  it('emits the search params for a valid one-way search', () => {
    component.form.patchValue(validValues());
    component.submit();

    expect(emitted).toEqual([
      { from: 'MAA', to: 'DEL', departureDate: '2999-03-10', returnDate: null, passengers: 2 },
    ]);
  });

  it('emits the return date for a round trip', () => {
    component.form.patchValue({ ...validValues(), returnDate: '2999-03-15' });
    component.submit();

    expect(emitted[0].returnDate).toBe('2999-03-15');
  });

  it('swaps origin and destination', () => {
    component.form.patchValue(validValues());
    component.swapAirports();

    expect(component.form.controls.from.value).toBe('DEL');
    expect(component.form.controls.to.value).toBe('MAA');
  });

  it('fills the form from the value input', () => {
    component.value = { from: 'DEL', to: 'MAA', departureDate: '2999-04-01', returnDate: null, passengers: 3 };

    expect(component.form.getRawValue()).toEqual({
      from: 'DEL',
      to: 'MAA',
      departureDate: '2999-04-01',
      returnDate: '',
      passengers: 3,
    });
  });
});
