import { useEffect, useRef, useState } from 'react';
import { usePrayerStore } from '@/stores/prayerStore';
import {
  getCurrentPrayer,
  getNextPrayer,
  msUntilNextPrayer,
  getPrayerProgress,
} from '@/utils/calculations';
import { formatCountdown } from '@/utils/date';
import type { CountdownState } from '@/types';

const INITIAL_STATE: CountdownState = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalSeconds: 0,
  nextPrayer: null,
  currentPrayer: null,
  progressPercent: 0,
};

export function useCountdown(): CountdownState {
  const dailyTimes = usePrayerStore((s) => s.dailyTimes);
  const setCurrentAndNext = usePrayerStore((s) => s.setCurrentAndNext);
  const [state, setState] = useState<CountdownState>(INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = () => {
    if (!dailyTimes) return;

    const now = Date.now();
    const prayers = dailyTimes.prayers;
    const current = getCurrentPrayer(prayers, now);
    const next = getNextPrayer(prayers, current);
    const msLeft = msUntilNextPrayer(prayers, next, now);
    const progress = getPrayerProgress(prayers, current, next, now);

    setCurrentAndNext(current, next);

    const totalSeconds = Math.floor(msLeft / 1000);
    const { hours, minutes, seconds } = formatCountdown(totalSeconds);

    setState({
      hours,
      minutes,
      seconds,
      totalSeconds,
      nextPrayer: next,
      currentPrayer: current,
      progressPercent: Math.round(progress * 100),
    });
  };

  useEffect(() => {
    if (!dailyTimes) return;

    tick(); // immediate tick

    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyTimes]);

  return state;
}
