import { motion } from 'motion/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatPrayerTime } from '@/utils/date';
import type { PrayerTime, PrayerName } from '@/types';

interface PrayerCardProps {
  prayer: PrayerTime;
  isCurrent: boolean;
  isNext: boolean;
  index: number;
}

const CHECK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const NEXT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PRAYER_ICONS: Record<PrayerName, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌆',
  Isha: '🌃',
};

export function PrayerCard({ prayer, isCurrent, isNext, index }: PrayerCardProps) {
  const { t, isRTL } = useTranslation();
  const timeFormat = useSettingsStore((s) => s.timeFormat);

  const cardClass = isNext
    ? 'ring-1 ring-white/30 bg-white/10'
    : isCurrent
    ? 'bg-white/8'
    : 'bg-white/5';

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl glass px-4 py-3.5 ${cardClass}`}
      initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
    >
      {/* Next prayer glow pulse */}
      {isNext && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/5"
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-center justify-between">
        {/* Prayer name + icon */}
        <div className="flex items-center gap-3">
          <span className="text-lg" role="img" aria-hidden="true">
            {PRAYER_ICONS[prayer.name]}
          </span>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${isCurrent || isNext ? 'text-white' : 'text-white/70'}`}>
              {t(`prayer.${prayer.name}`)}
            </span>
            {isNext && (
              <span className="text-xs text-white/50">{t('ui.nextPrayer')}</span>
            )}
            {isCurrent && (
              <span className="text-xs text-white/50">{t('ui.currentPrayer')}</span>
            )}
          </div>
        </div>

        {/* Time + status */}
        <div className="flex items-center gap-2">
          <span dir="ltr" className={`font-mono text-sm tabular-nums ${isCurrent || isNext ? 'text-white' : 'text-white/60'}`}>
            {formatPrayerTime(prayer.time, timeFormat)}
          </span>
          {isCurrent && (
            <span className="text-emerald-400">{CHECK_ICON}</span>
          )}
          {isNext && (
            <span className="text-amber-300">{NEXT_ICON}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
