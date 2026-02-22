import { useEffect, useRef } from 'react';
import { usePrayerStore } from '@/stores/prayerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  interpolateGradient,
  applyGradientToDOM,
  getNextPeriod,
} from '@/utils/gradients';
import { prayerToPeriod } from '@/utils/calculations';

const GRADIENT_UPDATE_INTERVAL = 30_000; // 30 seconds

/**
 * Side-effect-only hook — no return value.
 * Wires countdown progress → gradient CSS custom property updates.
 * Call once in App.tsx.
 */
export function useGradient(): void {
  const currentPrayer = usePrayerStore((s) => s.currentPrayer);
  const nextPrayer = usePrayerStore((s) => s.nextPrayer);
  const dailyTimes = usePrayerStore((s) => s.dailyTimes);
  const theme = useSettingsStore((s) => s.theme);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateGradient = () => {
    const currentPeriod = prayerToPeriod(currentPrayer);
    const nextPeriod = nextPrayer ? prayerToPeriod(nextPrayer) : getNextPeriod(currentPeriod);

    let progress = 0;
    if (dailyTimes) {
      const now = Date.now();
      const prayers = dailyTimes.prayers;
      const currentP = prayers.find((p) => p.name === currentPrayer);
      const nextP = prayers.find((p) => p.name === nextPrayer);

      if (currentP && nextP) {
        const elapsed = now - currentP.timestamp;
        const duration = nextP.timestamp - currentP.timestamp;
        progress = duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 0;
      } else if (nextP && !currentP) {
        // Before Fajr — estimate
        progress = 0;
      }
    }

    const palette = interpolateGradient(currentPeriod, nextPeriod, progress, theme);
    applyGradientToDOM(palette);
  };

  useEffect(() => {
    updateGradient();

    intervalRef.current = setInterval(updateGradient, GRADIENT_UPDATE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrayer, nextPrayer, theme, dailyTimes]);
}
