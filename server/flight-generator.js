const airports = require('./airports.json');

const airportByCode = new Map(airports.map((a) => [a.code, a]));
const HUBS = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA'];

const AIRLINES = [
  { name: 'IndiGo', code: '6E', factor: 1.0, intl: true },
  { name: 'Air India', code: 'AI', factor: 1.15, intl: true },
  { name: 'Air India Express', code: 'IX', factor: 0.9, intl: true },
  { name: 'SpiceJet', code: 'SG', factor: 0.92, intl: false },
  { name: 'Akasa Air', code: 'QP', factor: 0.95, intl: false },
  // foreign carriers only fly to / from their home city
  { name: 'Emirates', code: 'EK', factor: 1.35, intl: true, only: 'DXB' },
  { name: 'Singapore Airlines', code: 'SQ', factor: 1.4, intl: true, only: 'SIN' },
  { name: 'Thai Airways', code: 'TG', factor: 1.1, intl: true, only: 'BKK' },
  { name: 'SriLankan Airlines', code: 'UL', factor: 1.0, intl: true, only: 'CMB' },
];

const AIRCRAFT = ['Airbus A320neo', 'Airbus A321', 'Boeing 737-800', 'ATR 72-600', 'Airbus A320ceo', 'Boeing 787-8'];

// seeded random: FNV-1a hash + mulberry32 (https://stackoverflow.com/a/47593316)
// same search -> same flights, otherwise /flights/:id couldn't find the flight again
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distanceKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// local times are stored in UTC Dates so the server's own timezone doesn't matter
function formatLocal(d) {
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`
  );
}

function daysUntil(dateStr) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - todayUtc) / 86400000);
}

function pickStopovers(rand, from, to, count) {
  const options = HUBS.filter((h) => h !== from && h !== to);
  const result = [];
  while (result.length < count && options.length) {
    result.push(options.splice(Math.floor(rand() * options.length), 1)[0]);
  }
  return result;
}

function buildFlight(from, to, date, index, rand) {
  const origin = airportByCode.get(from);
  const dest = airportByCode.get(to);
  const international = origin.country !== dest.country;
  const km = distanceKm(origin, dest);

  const candidates = AIRLINES.filter((a) => {
    if (a.only) return a.only === from || a.only === to;
    return international ? a.intl : true;
  });
  const airline = candidates[Math.floor(rand() * candidates.length)];

  const roll = rand();
  const stops = roll < 0.62 ? 0 : roll < 0.92 ? 1 : 2;
  const stopovers = pickStopovers(rand, from, to, stops);

  const hour = 5 + Math.floor(rand() * 19); // 05:00 - 23:55
  const minute = Math.floor(rand() * 12) * 5;
  const [y, m, d] = date.split('-').map(Number);
  const depLocal = Date.UTC(y, m - 1, d, hour, minute);

  const airMinutes = Math.round(35 + (km / 780) * 60);
  const layoverMinutes = stopovers.map(() => 60 + Math.floor(rand() * 80));
  const durationMinutes = airMinutes + stops * 25 + layoverMinutes.reduce((s, v) => s + v, 0);

  const depUtc = depLocal - origin.utcOffset * 60000;
  const arrLocal = depUtc + durationMinutes * 60000 + dest.utcOffset * 60000;

  let price = (international ? 9000 + km * 5.5 : 2200 + km * 4.2) * airline.factor;
  if (stops === 1) price *= 0.88;
  if (stops === 2) price *= 0.8;
  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21)) price *= 1.12;
  if (hour < 5 || hour >= 22) price *= 0.92;
  const lead = daysUntil(date);
  if (lead <= 3) price *= 1.35;
  else if (lead <= 7) price *= 1.2;
  else if (lead <= 14) price *= 1.1;
  price *= 0.92 + rand() * 0.18;
  price = Math.round(price / 10) * 10;

  const baseFare = Math.round(price * 0.82);
  const flightNo = 100 + Math.floor(rand() * 900);
  const fullService = ['AI', 'EK', 'SQ', 'TG', 'UL'].includes(airline.code);

  return {
    id: `${from}-${to}-${date}-${index}`,
    airline: airline.name,
    airlineCode: airline.code,
    flightNumber: `${airline.code} ${flightNo}`,
    from,
    to,
    departureTime: formatLocal(new Date(depLocal)),
    arrivalTime: formatLocal(new Date(arrLocal)),
    durationMinutes,
    stops,
    stopovers,
    layoverMinutes,
    price,
    currency: 'INR',
    fare: { baseFare, taxesAndFees: price - baseFare },
    aircraft: AIRCRAFT[Math.floor(rand() * (international ? AIRCRAFT.length : AIRCRAFT.length - 1))],
    cabinBaggageKg: 7,
    checkInBaggageKg: fullService ? (international ? 30 : 25) : international ? 20 : 15,
    mealIncluded: fullService || rand() > 0.7,
    refundable: rand() > 0.55,
    seatsLeft: 1 + Math.floor(rand() * 14),
  };
}

function generateFlights(from, to, date) {
  const rand = mulberry32(hashString(`${from}|${to}|${date}`));
  const count = 9 + Math.floor(rand() * 6);
  const flights = [];
  for (let i = 0; i < count; i++) {
    flights.push(buildFlight(from, to, date, i, rand));
  }
  return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

// ids are assigned before sorting, so look the flight up by id rather than by position
function findFlight(id) {
  const match = /^([A-Z]{3})-([A-Z]{3})-(\d{4}-\d{2}-\d{2})-(\d+)$/.exec(id);
  if (!match) return null;
  const [, from, to, date] = match;
  if (!airportByCode.has(from) || !airportByCode.has(to)) return null;
  return generateFlights(from, to, date).find((f) => f.id === id) || null;
}

module.exports = { airports, airportByCode, generateFlights, findFlight };
