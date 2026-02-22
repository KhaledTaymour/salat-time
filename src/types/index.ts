// ─── Prayer Domain ────────────────────────────────────────────────────────────

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export type PrayerPeriod = PrayerName | 'pre-fajr';

export interface PrayerTime {
  name: PrayerName;
  time: string;       // "HH:MM" format
  timestamp: number;  // Unix ms
}

// ─── Calculation Settings ─────────────────────────────────────────────────────

/**
 * Al Adhan calculation methods:
 * 1=Karachi, 2=ISNA, 3=MWL, 4=Mecca (UmmAlQura), 5=Egyptian,
 * 7=Tehran, 8=Gulf, 9=Kuwait, 10=Qatar, 11=Singapore,
 * 12=France, 13=Turkey, 14=Russia, 15=Moonsighting
 */
export type CalculationMethod = 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

/** 0 = Shafi'i / Standard, 1 = Hanafi */
export type AsrSchool = 0 | 1;

/**
 * Days to shift the Hijri date returned by the Al Adhan API.
 * 0  = astronomical default (matches Saudi Umm al-Qura).
 * -1 = one day behind (e.g. Egypt/Levant moon-sighting announcements).
 * +1 = one day ahead (rare, but some communities follow early sighting).
 */
export type HijriAdjustment = -2 | -1 | 0 | 1 | 2;

// ─── Locale & Theme ───────────────────────────────────────────────────────────

export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';
export type TimeFormat = '12h' | '24h';

// ─── Location ─────────────────────────────────────────────────────────────────

export type LocationStatus = 'idle' | 'detecting' | 'detected' | 'manual' | 'error';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  countryCode: string;
}

// ─── Gradient System ──────────────────────────────────────────────────────────

export interface GradientPalette {
  from: string;
  via?: string;
  to: string;
}

export interface GradientTheme {
  dark: GradientPalette;
  light: GradientPalette;
}

// ─── Countdown ────────────────────────────────────────────────────────────────

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  nextPrayer: PrayerName | null;
  currentPrayer: PrayerName | null;
  progressPercent: number; // 0–100
}

// ─── Hijri / Gregorian Dates ─────────────────────────────────────────────────

export interface HijriDate {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
}

export interface GregorianDate {
  day: string;
  month: { number: number; en: string };
  year: string;
  weekday: { en: string };
}

// ─── Al Adhan API ─────────────────────────────────────────────────────────────

export interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface AladhanMeta {
  latitude: number;
  longitude: number;
  timezone: string;
  method: { id: number; name: string };
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
}

export interface AladhanDateInfo {
  hijri: {
    date: string;
    day: string;
    month: { number: number; en: string; ar: string };
    year: string;
    weekday: { en: string; ar: string };
  };
  gregorian: {
    date: string;
    day: string;
    month: { number: number; en: string };
    year: string;
    weekday: { en: string };
  };
}

export interface AladhanData {
  timings: AladhanTimings;
  date: AladhanDateInfo;
  meta: AladhanMeta;
}

export interface AladhanResponse {
  code: number;
  status: string;
  data: AladhanData;
}

// ─── Daily Prayer Times (domain model) ───────────────────────────────────────

export interface DailyPrayerTimes {
  prayers: PrayerTime[];
  hijri: HijriDate;
  gregorian: GregorianDate;
  timezone: string;
  fetchedAt: number; // Unix ms — for cache invalidation
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Settings {
  language: Language;
  theme: Theme;
  method: CalculationMethod;
  school: AsrSchool;
  hijriAdjustment: HijriAdjustment;
  timeFormat: TimeFormat;
  location: Location | null;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

export interface TranslationKeys {
  // Prayer names
  'prayer.Fajr': string;
  'prayer.Sunrise': string;
  'prayer.Dhuhr': string;
  'prayer.Asr': string;
  'prayer.Maghrib': string;
  'prayer.Isha': string;

  // UI strings
  'ui.nextPrayer': string;
  'ui.currentPrayer': string;
  'ui.loading': string;
  'ui.error': string;
  'ui.retry': string;
  'ui.offline': string;
  'ui.hours': string;
  'ui.minutes': string;
  'ui.seconds': string;
  'ui.searchPlaceholder': string;
  'ui.useMyLocation': string;
  'ui.detectingLocation': string;
  'ui.locationError': string;
  'ui.noResults': string;

  // Settings
  'settings.title': string;
  'settings.theme': string;
  'settings.language': string;
  'settings.calculationMethod': string;
  'settings.asrSchool': string;
  'settings.location': string;
  'settings.changeLocation': string;
  'settings.recommended': string;
  'settings.hijriAdjustment': string;
  'settings.hijriAdjustmentHint': string;
  'settings.timeFormat': string;
  'settings.timeFormat12h': string;
  'settings.timeFormat24h': string;

  // Theme
  'theme.dark': string;
  'theme.light': string;

  // Asr school
  'school.shafii': string;
  'school.hanafi': string;

  // Hijri months
  'hijri.1': string;
  'hijri.2': string;
  'hijri.3': string;
  'hijri.4': string;
  'hijri.5': string;
  'hijri.6': string;
  'hijri.7': string;
  'hijri.8': string;
  'hijri.9': string;
  'hijri.10': string;
  'hijri.11': string;
  'hijri.12': string;

  // Calculation methods
  'method.1': string;
  'method.2': string;
  'method.3': string;
  'method.4': string;
  'method.5': string;
  'method.7': string;
  'method.8': string;
  'method.9': string;
  'method.10': string;
  'method.11': string;
  'method.12': string;
  'method.13': string;
  'method.14': string;
  'method.15': string;
}

// ─── Nominatim ────────────────────────────────────────────────────────────────

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country: string;
    country_code: string;
  };
}
