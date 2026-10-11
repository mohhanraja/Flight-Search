const express = require('express');
const { airports, airportByCode, generateFlights, findFlight } = require('./flight-generator');

const app = express();
const PORT = process.env.PORT || 3000;
const DELAY_MS = Number(process.env.MOCK_DELAY ?? 700);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function todayString() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// fake delay so the loader is visible
app.use('/api', (_req, _res, next) => setTimeout(next, DELAY_MS));

app.get('/api/airports', (_req, res) => {
  res.json(airports.map(({ code, city, name, country }) => ({ code, city, name, country })));
});

app.get('/api/flights', (req, res) => {
  const { from, to, departureDate, returnDate } = req.query;
  const passengers = Number(req.query.passengers ?? 1);

  const errors = [];
  if (!airportByCode.has(from)) errors.push('Unknown origin airport');
  if (!airportByCode.has(to)) errors.push('Unknown destination airport');
  if (from && from === to) errors.push('Origin and destination must be different');
  if (!isRealDate(departureDate)) errors.push('departureDate must be a valid date (YYYY-MM-DD)');
  else if (departureDate < todayString()) errors.push('Departure date cannot be in the past');
  if (returnDate) {
    if (!isRealDate(returnDate)) errors.push('returnDate must be a valid date (YYYY-MM-DD)');
    else if (isRealDate(departureDate) && returnDate < departureDate) {
      errors.push('Return date cannot be before the departure date');
    }
  }
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
    errors.push('passengers must be between 1 and 9');
  }

  if (errors.length) {
    return res.status(400).json({ message: errors.join('. ') });
  }

  res.json({
    outbound: generateFlights(from, to, departureDate),
    inbound: returnDate ? generateFlights(to, from, returnDate) : null,
  });
});

app.get('/api/flights/:id', (req, res) => {
  const flight = findFlight(req.params.id);
  if (!flight) {
    return res.status(404).json({ message: `Flight ${req.params.id} was not found` });
  }
  res.json(flight);
});

app.use('/api', (_req, res) => res.status(404).json({ message: 'Endpoint not found' }));

app.listen(PORT, () => {
  console.log(`Mock flight API running on http://localhost:${PORT}/api`);
});
