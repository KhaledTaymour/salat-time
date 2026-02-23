import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { searchCity, reverseGeocode } from '@/api/aladhan';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { suggestMethod } from '@/utils/calculations';
import type { Location } from '@/types';

export function LocationPrompt() {
  const { t, language } = useTranslation();
  const setLocation = useSettingsStore((s) => s.setLocation);
  const setMethod = useSettingsStore((s) => s.setMethod);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectLocation = (loc: Location) => {
    setLocation(loc);
    setMethod(suggestMethod(loc.countryCode));
  };

  const useGPS = () => {
    if (!navigator.geolocation) {
      setGpsError(t('ui.locationError'));
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (loc) {
            selectLocation(loc);
          } else {
            selectLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              city: 'Unknown',
              country: 'Unknown',
              countryCode: 'XX',
            });
          }
        } catch {
          setGpsError(t('ui.locationError'));
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        setGpsError(t('ui.locationError'));
      },
      { timeout: 10_000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setSearchLoading(true);
      try {
        const found = await searchCity(query, abortRef.current.signal);
        setResults(found);
      } catch {
        // Aborted or network error
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Icon */}
        <span className="text-5xl">🕌</span>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white/90">
            {language === 'ar' ? 'وقت الصلاة' : 'Salat Time'}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {language === 'ar'
              ? 'حدّد موقعك لعرض مواقيت الصلاة'
              : 'Set your location to see prayer times'}
          </p>
        </div>

        {/* GPS button */}
        <button
          onClick={useGPS}
          disabled={gpsLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-3.5 text-sm
            font-medium text-white transition-colors hover:bg-white/25 active:scale-[0.98] disabled:opacity-50"
        >
          {gpsLoading ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
            </svg>
          )}
          {gpsLoading ? t('ui.detectingLocation') : t('ui.useMyLocation')}
        </button>

        {gpsError && (
          <p className="text-xs text-red-300/70">{gpsError}</p>
        )}

        {/* Divider */}
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30">
            {language === 'ar' ? 'أو ابحث يدوياً' : 'or search manually'}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Search input */}
        <div className="relative w-full">
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40">
            {searchLoading ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ui.searchPlaceholder')}
            className="w-full rounded-2xl bg-white/10 py-3 ps-9 pe-3 text-sm text-white placeholder-white/30
              outline-none ring-1 ring-white/10 focus:ring-white/30 transition-all"
          />
        </div>

        {/* Search results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              className="w-full overflow-hidden rounded-2xl bg-white/5 py-1"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {results.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(loc)}
                  className="w-full px-4 py-3 text-start transition-colors hover:bg-white/10"
                >
                  <p className="text-sm text-white/90">{loc.city}</p>
                  <p className="text-xs text-white/40">{loc.country}</p>
                </button>
              ))}
            </motion.div>
          )}
          {query.trim() && !searchLoading && results.length === 0 && (
            <motion.p
              className="text-center text-sm text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {t('ui.noResults')}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
