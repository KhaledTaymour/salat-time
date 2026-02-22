import { AnimatePresence, motion } from 'motion/react';
import { usePrayerStore } from '@/stores/prayerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { PrayerCard } from './PrayerCard';

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      className="rounded-2xl glass bg-white/5 px-4 py-3.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-white/10" />
          <div className="h-4 w-20 rounded bg-white/10" />
        </div>
        <div className="h-4 w-16 rounded bg-white/10" />
      </div>
    </motion.div>
  );
}

export function PrayerList() {
  const { dailyTimes, status, error, currentPrayer, nextPrayer } = usePrayerStore();
  const fetchTimes = usePrayerStore((s) => s.fetchTimes);
  const location = useSettingsStore((s) => s.location);
  const method = useSettingsStore((s) => s.method);
  const school = useSettingsStore((s) => s.school);
  const { t } = useTranslation();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        className="rounded-2xl glass bg-red-500/10 px-4 py-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="mb-3 text-sm text-white/70">{t('ui.error')}</p>
        <p className="mb-4 text-xs text-red-300/60">{error}</p>
        <button
          onClick={() => {
            if (location) void fetchTimes(location, method, school);
          }}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20"
        >
          {t('ui.retry')}
        </button>
      </motion.div>
    );
  }

  if (!dailyTimes) return null;

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {dailyTimes.prayers.map((prayer, index) => (
          <PrayerCard
            key={prayer.name}
            prayer={prayer}
            isCurrent={currentPrayer === prayer.name}
            isNext={nextPrayer === prayer.name}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
