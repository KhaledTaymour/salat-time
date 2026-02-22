import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';
import { ThemeToggle } from './ThemeToggle';
import { TimeFormatToggle } from './TimeFormatToggle';
import { LanguageToggle } from './LanguageToggle';
import { MethodSelector } from './MethodSelector';
import { AsrSchoolToggle } from './AsrSchoolToggle';
import { HijriAdjustmentControl } from './HijriAdjustmentControl';
import { LocationSearch } from './LocationSearch';

interface SettingsPanelProps {
  onClose: () => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { t, isRTL } = useTranslation();
  const location = useSettingsStore((s) => s.location);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        className="fixed inset-y-0 z-50 w-full max-w-sm bg-slate-900/95 shadow-2xl backdrop-blur-xl"
        style={{ [isRTL ? 'left' : 'right']: 0 }}
        initial={{ x: isRTL ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: isRTL ? '-100%' : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <h2 className="text-base font-semibold text-white/90">{t('settings.title')}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close settings"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 px-4 py-6">
            {/* Appearance */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
                Appearance
              </h3>
              <ThemeToggle />
              <TimeFormatToggle />
              <LanguageToggle />
            </section>

            <div className="h-px bg-white/10" />

            {/* Location */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
                {t('settings.location')}
              </h3>
              {location ? (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/80">{location.city}</p>
                    <p className="text-xs text-white/40">{location.country}</p>
                  </div>
                  <button
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                    className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/20"
                  >
                    {t('settings.changeLocation')}
                  </button>
                </div>
              ) : null}
              <AnimatePresence>
                {(showLocationSearch || !location) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <LocationSearch onDone={() => setShowLocationSearch(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <div className="h-px bg-white/10" />

            {/* Prayer Calculation */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
                Prayer Calculation
              </h3>
              <AsrSchoolToggle />
              <HijriAdjustmentControl />
              <MethodSelector />
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
