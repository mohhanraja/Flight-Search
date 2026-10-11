import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  {
    path: 'search',
    title: 'Search flights',
    loadComponent: () =>
      import('./features/search/search-page/search-page.component').then((m) => m.SearchPageComponent),
  },
  {
    path: 'flights/:id',
    title: 'Flight details',
    loadComponent: () =>
      import('./features/flight-details/flight-details.component').then((m) => m.FlightDetailsComponent),
  },
  { path: '**', redirectTo: 'search' },
];
