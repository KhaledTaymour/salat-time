import type {
  AladhanResponse,
  CalculationMethod,
  AsrSchool,
  DailyPrayerTimes,
  Location,
  NominatimResult,
  PrayerName,
  PrayerTime,
} from '@/types';
import { prayerTimeToTimestamp } from '@/utils/date';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: 'NETWORK' | 'PARSE' | 'NOT_FOUND' | 'RATE_LIMIT' | 'SERVER'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Prayer Times ─────────────────────────────────────────────────────────────

interface FetchPrayerParams {
  latitude: number;
  longitude: number;
  method: CalculationMethod;
  school: AsrSchool;
  adjustment?: number;
  date?: Date;
}

const PRAYER_KEYS: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export async function fetchPrayerTimes(params: FetchPrayerParams): Promise<DailyPrayerTimes> {
  const { latitude, longitude, method, school, adjustment, date = new Date() } = params;
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const url = new URL(`${ALADHAN_BASE}/timings/${unixTimestamp}`);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('method', method.toString());
  url.searchParams.set('school', school.toString());
  if (adjustment !== undefined && adjustment !== 0) {
    url.searchParams.set('adjustment', adjustment.toString());
  }

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw new ApiError('Network request failed', 'NETWORK');
  }

  if (response.status === 429) throw new ApiError('Rate limited', 'RATE_LIMIT');
  if (response.status >= 500) throw new ApiError('Server error', 'SERVER');
  if (!response.ok) throw new ApiError(`HTTP ${response.status}`, 'NETWORK');

  let json: AladhanResponse;
  try {
    json = (await response.json()) as AladhanResponse;
  } catch {
    throw new ApiError('Failed to parse response', 'PARSE');
  }

  const timezone = json.data.meta.timezone;

  const prayers: PrayerTime[] = PRAYER_KEYS.map((name) => {
    // Al Adhan may return "15:30 (EET)" — strip timezone abbreviation
    const timeStr = json.data.timings[name].replace(/\s*\(.*\)$/, '');
    return {
      name,
      time: timeStr,
      timestamp: prayerTimeToTimestamp(timeStr, date, timezone),
    };
  });

  return {
    prayers,
    hijri: json.data.date.hijri,
    gregorian: json.data.date.gregorian,
    timezone,
    fetchedAt: Date.now(),
  };
}

// ─── City Search (Nominatim) ──────────────────────────────────────────────────

function nominatimToLocation(result: NominatimResult): Location {
  const addr = result.address;
  const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state ?? 'Unknown';
  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    city,
    country: addr.country,
    countryCode: addr.country_code.toUpperCase(),
  };
}

export async function searchCity(query: string, signal?: AbortSignal): Promise<Location[]> {
  if (!query.trim()) return [];

  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal,
      headers: { 'Accept-Language': 'en', 'User-Agent': 'SalatTimeApp/1.0' },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return [];
    throw new ApiError('Network request failed', 'NETWORK');
  }

  if (!response.ok) throw new ApiError(`HTTP ${response.status}`, 'NETWORK');

  let results: NominatimResult[];
  try {
    results = (await response.json()) as NominatimResult[];
  } catch {
    throw new ApiError('Failed to parse response', 'PARSE');
  }

  return results.map(nominatimToLocation);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<Location | null> {
  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'SalatTimeApp/1.0' },
    });
  } catch {
    throw new ApiError('Network request failed', 'NETWORK');
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError(`HTTP ${response.status}`, 'NETWORK');

  let result: NominatimResult;
  try {
    result = (await response.json()) as NominatimResult;
  } catch {
    throw new ApiError('Failed to parse response', 'PARSE');
  }

  return nominatimToLocation(result);
}
