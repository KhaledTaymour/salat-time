import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AsrSchool, CalculationMethod, HijriAdjustment, Language, Location, Theme, TimeFormat } from '@/types';

interface SettingsState {
  language: Language;
  theme: Theme;
  method: CalculationMethod;
  school: AsrSchool;
  hijriAdjustment: HijriAdjustment;
  timeFormat: TimeFormat;
  location: Location | null;

  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setMethod: (method: CalculationMethod) => void;
  setSchool: (school: AsrSchool) => void;
  setHijriAdjustment: (adj: HijriAdjustment) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setLocation: (location: Location | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'dark',
      method: 2,
      school: 0,
      hijriAdjustment: 0,
      timeFormat: '24h',
      location: null,

      setLanguage: (language) => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        set({ language });
      },

      setTheme: (theme) => {
        document.documentElement.dataset['theme'] = theme;
        set({ theme });
      },

      setMethod: (method) => set({ method }),
      setSchool: (school) => set({ school }),
      setHijriAdjustment: (hijriAdjustment) => set({ hijriAdjustment }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setLocation: (location) => set({ location }),
    }),
    {
      name: 'salat-settings',
      // Only persist data fields, not actions
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        method: state.method,
        school: state.school,
        hijriAdjustment: state.hijriAdjustment,
        timeFormat: state.timeFormat,
        location: state.location,
      }),
    }
  )
);
