import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePrayerStore } from '@/stores/prayerStore';

function isSameDay(tsA: number, tsB: number): boolean {
  const a = new Date(tsA);
  const b = new Date(tsB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function usePrayerTimes() {
  const location = useSettingsStore((s) => s.location);
  const method = useSettingsStore((s) => s.method);
  const school = useSettingsStore((s) => s.school);
  const hijriAdjustment = useSettingsStore((s) => s.hijriAdjustment);

  const fetchTimes = usePrayerStore((s) => s.fetchTimes);
  const dailyTimes = usePrayerStore((s) => s.dailyTimes);

  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = () => {
    if (!location) return;
    void fetchTimes(location, method, school, hijriAdjustment);
  };

  const scheduleMidnightRefetch = () => {
    if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);

    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 1, 0, 0); // 00:01 next day

    const msUntilMidnight = midnight.getTime() - now.getTime();
    midnightTimerRef.current = setTimeout(() => {
      fetch();
      scheduleMidnightRefetch();
    }, msUntilMidnight);
  };

  useEffect(() => {
    if (!location) return;

    const needsFetch =
      !dailyTimes || !isSameDay(dailyTimes.fetchedAt, Date.now());

    if (needsFetch) {
      fetch();
    }

    scheduleMidnightRefetch();

    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, method, school, hijriAdjustment]);
}
