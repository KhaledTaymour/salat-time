import { create } from 'zustand';
import { fetchPrayerTimes } from '@/api/aladhan';
import type { AsrSchool, CalculationMethod, DailyPrayerTimes, Location, PrayerName } from '@/types';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface PrayerState {
  dailyTimes: DailyPrayerTimes | null;
  status: FetchStatus;
  error: string | null;
  currentPrayer: PrayerName | null;
  nextPrayer: PrayerName | null;

  fetchTimes: (
    location: Location,
    method: CalculationMethod,
    school: AsrSchool,
    adjustment?: number
  ) => Promise<void>;
  setCurrentAndNext: (current: PrayerName | null, next: PrayerName | null) => void;
  clearError: () => void;
}

export const usePrayerStore = create<PrayerState>()((set, get) => ({
  dailyTimes: null,
  status: 'idle',
  error: null,
  currentPrayer: null,
  nextPrayer: null,

  fetchTimes: async (location, method, school, adjustment) => {
    // Avoid duplicate in-flight requests
    if (get().status === 'loading') return;

    set({ status: 'loading', error: null });

    try {
      const data = await fetchPrayerTimes({ ...location, method, school, adjustment });
      set({ dailyTimes: data, status: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prayer times';
      set({ status: 'error', error: message });
    }
  },

  setCurrentAndNext: (current, next) => set({ currentPrayer: current, nextPrayer: next }),

  clearError: () => set({ error: null }),
}));
