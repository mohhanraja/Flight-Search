# Flight Search Application

Flight search app in Angular 18, done for the REST API integration task. You can search flights between two airports, filter and sort the results and open a details page for a flight.

The flights come from a small mock API written with Express (in `server/`), so everything runs locally.

## Setup

Node 18.19 or newer is needed (I used Node 22).

```bash
npm install
npm start
```

`npm start` runs both the mock API (port 3000) and the Angular dev server (port 4200). Then open http://localhost:4200.

Other scripts:

- `npm run api` - only the mock API
- `npm run start:app` - only the Angular app, the API has to be running on port 3000
- `npm run build` - production build
- `npm test` - unit tests (Karma + Jasmine, needs Chrome)

The dev server proxies `/api` to port 3000 (see `proxy.conf.json`), so there is no CORS setup. The mock API waits 700 ms before every response so the loading state can be seen. This can be changed with the `MOCK_DELAY` env variable.

## Tech used

- Angular 18 - standalone components, `@if` / `@for` control flow, lazy loaded routes
- TypeScript (strict)
- Reactive forms, HttpClient with a functional interceptor, RxJS
- SCSS, no UI library
- Express for the mock API
- Jasmine + Karma for tests

## API

| Method | Endpoint | |
| --- | --- | --- |
| GET | `/api/airports` | airport list (`code`, `city`, `name`, `country`) |
| GET | `/api/flights` | search flights |
| GET | `/api/flights/:id` | one flight |

Query params for `/api/flights`:

| Param | Required | |
| --- | --- | --- |
| `from`, `to` | yes | airport codes, can't be the same |
| `departureDate` | yes | `YYYY-MM-DD`, not in the past |
| `returnDate` | no | `YYYY-MM-DD`, not before departureDate |
| `passengers` | no | 1 to 9, default 1 |

Example: `/api/flights?from=MAA&to=DEL&departureDate=2026-11-20&passengers=2`

The response looks like `{ "outbound": [...], "inbound": null }`. `inbound` only has flights when `returnDate` is sent. Invalid params give a 400 with `{ "message": "..." }` and an unknown flight id gives a 404.

About the mock data: every route + date gets 9 to 14 flights. The random generator is seeded with the route and date, so the same search always returns the same flights. This is needed because the details page loads the flight again by its id. Duration, price, stops and airlines depend on the distance between the airports, and the price also goes up when the date is close.

## Folder structure

```
server/            mock API (express)
src/app/
  core/            models, FlightApiService, error interceptor, utils
  shared/          spinner, error message, duration + stops pipes
  features/
    search/        search page, form, results, filter panel, flight card
    flight-details/
```

## Implementation decisions

- The search is kept in the URL (`/search?from=MAA&to=DEL&...`). Submitting the form only changes the query params and the search page loads the results from them. So refresh, back button and sharing the link all work, and I didn't need a separate store.
- The query params are piped into the API call with `switchMap`, so if a new search starts while the old one is still loading, the old request is cancelled.
- `toLoadable()` in `core/utils/loadable.ts` turns a request into loading / success / error states, so each template handles all three from one `async` pipe.
- Filtering and sorting are plain functions in `flight-filters.ts` so they are easy to test. Filters: max price, stops, airlines. Sorting: price, duration, departure time. The filter panel is debounced by 150 ms, and switching between outbound and return resets the filters.
- Flight details is its own route and not a modal, so it has a URL and works after refresh.
- Components don't use HttpClient directly, everything goes through `FlightApiService`. The base URL is an injection token (easier to test) and the airport list is cached after the first call.
- Errors: the interceptor turns HTTP errors into an `ApiError` with a readable message (server not reachable, 400, 404, 5xx). Requests time out after 15 s. The UI shows the message with a "Try again" button.
- The smaller components (flight card, filter panel, spinner, error message) use OnPush and only talk through inputs/outputs.
- Form validation: everything is required except return date, passengers must be a whole number from 1 to 9, dates can't be in the past, from and to must be different, return date can't be before departure. Errors show once the field is touched.
- Prices are in INR and formatted with the `en-IN` locale.

## Assumptions

- Return date is optional. Without it the search is one-way, with it the results have an Outbound and a Return tab (each with its own filters).
- Price is per passenger. The card and the details page also show the total for the selected passengers.
- Departure/arrival times are local to each airport. Arrival is calculated with the time zone difference and `+1` means it lands the next day.
- All flight data (fares, baggage, seats etc.) is generated and not real.
- There are 17 airports, mostly Indian cities and a few international ones.
- No booking. Clicking a flight only opens its details.

## Tests

`npm test` runs the unit tests: pipes, filter/sort functions, date utils, form validators, FlightApiService (with HttpTestingController), the error interceptor, `toLoadable` and the search form, filter panel and flight card components.

There are no e2e tests yet.
