import type { GradientPalette, GradientTheme, PrayerPeriod, Theme } from '@/types';

// ─── Palette Definitions ──────────────────────────────────────────────────────

export const GRADIENT_PALETTES: Record<PrayerPeriod, GradientTheme> = {
  'pre-fajr': {
    dark:  { from: '#020409', via: '#0a0a1a', to: '#0d0520' },
    light: { from: '#1a1a3e', via: '#2d2b5e', to: '#1a0a2e' },
  },
  Fajr: {
    dark:  { from: '#0f0c29', via: '#302b63', to: '#24243e' },
    light: { from: '#2d2b6b', via: '#5048a8', to: '#3d3980' },
  },
  Sunrise: {
    dark:  { from: '#1a0a00', via: '#6b2f0a', to: '#c4720a' },
    light: { from: '#ff6b35', via: '#f7931e', to: '#ffd700' },
  },
  Dhuhr: {
    dark:  { from: '#1c1400', via: '#3d2f00', to: '#4a3800' },
    light: { from: '#b8860b', via: '#daa520', to: '#ffd700' },
  },
  Asr: {
    dark:  { from: '#1a0f00', via: '#4a2e00', to: '#6b4400' },
    light: { from: '#cd7f32', via: '#b8860b', to: '#8b6914' },
  },
  Maghrib: {
    dark:  { from: '#2d0a00', via: '#6b1f1f', to: '#2e0a4a' },
    light: { from: '#dc143c', via: '#c2185b', to: '#6a0080' },
  },
  Isha: {
    dark:  { from: '#020409', via: '#0d1b2a', to: '#0a0a1e' },
    light: { from: '#1a1a3e', via: '#0d1b2a', to: '#120a2e' },
  },
};

// ─── Color Math ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateColor(colorA: string, colorB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Interpolate between two prayer period gradients.
 * @param progress - 0 at period start, 1 at next prayer time
 */
export function interpolateGradient(
  currentPeriod: PrayerPeriod,
  nextPeriod: PrayerPeriod,
  progress: number,
  theme: Theme
): GradientPalette {
  const t = Math.max(0, Math.min(1, progress));
  const from = GRADIENT_PALETTES[currentPeriod][theme];
  const to = GRADIENT_PALETTES[nextPeriod][theme];

  const fromVia = from.via ?? from.from;
  const toVia = to.via ?? to.from;

  return {
    from: interpolateColor(from.from, to.from, t),
    via: interpolateColor(fromVia, toVia, t),
    to: interpolateColor(from.to, to.to, t),
  };
}

/**
 * Apply a gradient palette to CSS custom properties on :root.
 * The .gradient-bg class in index.css picks these up automatically.
 */
export function applyGradientToDOM(palette: GradientPalette): void {
  const root = document.documentElement;
  root.style.setProperty('--gradient-from', palette.from);
  root.style.setProperty('--gradient-via', palette.via ?? palette.from);
  root.style.setProperty('--gradient-to', palette.to);
}

/**
 * Map a prayer period to its next period for interpolation.
 */
export function getNextPeriod(period: PrayerPeriod): PrayerPeriod {
  const order: PrayerPeriod[] = [
    'pre-fajr', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha',
  ];
  const idx = order.indexOf(period);
  return order[(idx + 1) % order.length] ?? 'pre-fajr';
}
