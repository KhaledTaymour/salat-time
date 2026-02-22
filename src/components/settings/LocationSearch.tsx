import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { searchCity, reverseGeocode } from '@/api/aladhan';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { suggestMethod } from '@/utils/calculations';
import type { Location } from '@/types';

interface LocationSearchProps {
  onDone: () => void;
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const SpinnerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function LocationSearch({ onDone }: LocationSearchProps) {
  const { t } = useTranslation();
  const setLocation = useSettingsStore((s) => s.setLocation);
  const setMethod = useSettingsStore((s) => s.setMethod);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const found = await searchCity(query, abortRef.current.signal);
        setResults(found);
      } catch {
        // Aborted or network error — silently ignore
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectLocation = (loc: Location) => {
    setLocation(loc);
    setMethod(suggestMethod(loc.countryCode));
    onDone();
  };

  const useGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (loc) selectLocation(loc);
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
      { timeout: 10_000 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40">
          {loading ? <SpinnerIcon /> : <SearchIcon />}
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ui.searchPlaceholder')}
          className="w-full rounded-xl bg-white/10 py-2.5 ps-9 pe-3 text-sm text-white placeholder-white/30
            outline-none ring-1 ring-white/10 focus:ring-white/30 transition-all"
          autoFocus
        />
      </div>

      {/* GPS button */}
      <button
        onClick={useGPS}
        disabled={gpsLoading}
        className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm
          text-white/70 transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        {gpsLoading ? <SpinnerIcon /> : <LocationIcon />}
        {gpsLoading ? t('ui.detectingLocation') : t('ui.useMyLocation')}
      </button>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            className="overflow-hidden rounded-xl bg-white/5 py-1"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {results.map((loc, i) => (
              <button
                key={i}
                onClick={() => selectLocation(loc)}
                className="w-full px-3 py-2.5 text-start transition-colors hover:bg-white/10"
              >
                <p className="text-sm text-white/90">{loc.city}</p>
                <p className="text-xs text-white/40">{loc.country}</p>
              </button>
            ))}
          </motion.div>
        )}
        {query.trim() && !loading && results.length === 0 && (
          <motion.p
            className="text-center text-sm text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('ui.noResults')}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
