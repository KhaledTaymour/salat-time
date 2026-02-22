import type { CalculationMethod, PrayerName, PrayerPeriod, PrayerTime } from '@/types';

// ─── Prayer Period Logic ──────────────────────────────────────────────────────

/**
 * Returns the prayer whose window the current time falls within,
 * or null if before Fajr.
 */
export function getCurrentPrayer(
  prayers: PrayerTime[],
  now: number
): PrayerName | null {
  // Walk backwards: the most recent prayer whose timestamp <= now
  for (let i = prayers.length - 1; i >= 0; i--) {
    const prayer = prayers[i];
    if (prayer !== undefined && prayer.timestamp <= now) {
      return prayer.name;
    }
  }
  return null; // before Fajr
}

/**
 * Returns the next upcoming prayer, or null if all have passed today.
 */
export function getNextPrayer(
  prayers: PrayerTime[],
  currentPrayer: PrayerName | null
): PrayerName | null {
  if (currentPrayer === null) {
    // Before Fajr — next is Fajr
    return prayers[0]?.name ?? null;
  }
  const currentIdx = prayers.findIndex((p) => p.name === currentPrayer);
  if (currentIdx === -1) return null;
  return prayers[currentIdx + 1]?.name ?? null;
}

/**
 * Milliseconds until the next prayer. Returns 0 if next is null.
 */
export function msUntilNextPrayer(
  prayers: PrayerTime[],
  next: PrayerName | null,
  now: number
): number {
  if (next === null) return 0;
  const prayer = prayers.find((p) => p.name === next);
  if (!prayer) return 0;
  return Math.max(0, prayer.timestamp - now);
}

/**
 * Progress from current prayer to next, as 0–1.
 * Used to drive gradient interpolation.
 */
export function getPrayerProgress(
  prayers: PrayerTime[],
  current: PrayerName | null,
  next: PrayerName | null,
  now: number
): number {
  if (next === null) return 1;

  const nextPrayer = prayers.find((p) => p.name === next);
  if (!nextPrayer) return 0;

  let periodStart: number;
  if (current === null) {
    // Before Fajr: use midnight as start (approximate)
    periodStart = nextPrayer.timestamp - 90 * 60 * 1000; // ~90 min window
  } else {
    const currentPrayer = prayers.find((p) => p.name === current);
    if (!currentPrayer) return 0;
    periodStart = currentPrayer.timestamp;
  }

  const periodDuration = nextPrayer.timestamp - periodStart;
  if (periodDuration <= 0) return 0;

  return Math.max(0, Math.min(1, (now - periodStart) / periodDuration));
}

/**
 * Maps current prayer name to its PrayerPeriod (gradient key).
 */
export function prayerToPeriod(prayer: PrayerName | null): PrayerPeriod {
  if (prayer === null) return 'pre-fajr';
  return prayer;
}

// ─── Method Suggestion ───────────────────────────────────────────────────────

const REGION_METHOD_MAP: Record<string, CalculationMethod> = {
  US: 2, CA: 2,                         // ISNA
  SA: 4, AE: 4, KW: 9, QA: 10, BH: 4,  // Gulf / UmmAlQura
  EG: 5, LY: 5,                          // Egyptian
  MY: 11, SG: 11, ID: 11,               // Singapore
  PK: 1, IN: 1, BD: 1,                  // Karachi
  TR: 13,                                // Turkey
  IR: 7,                                 // Tehran
  FR: 12,                                // France
  RU: 14,                                // Russia
};

export function suggestMethod(countryCode: string): CalculationMethod {
  return REGION_METHOD_MAP[countryCode.toUpperCase()] ?? 2;
}
