import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCountdown } from '@/hooks/useCountdown';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePrayerStore } from '@/stores/prayerStore';

function AnimatedDigit({ value }: { value: string }) {
  return (
    <span className="digit-container w-[1ch]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="block"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function TimeSegment({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex font-mono text-4xl font-light tabular-nums text-white">
        <AnimatedDigit value={padded[0] ?? '0'} />
        <AnimatedDigit value={padded[1] ?? '0'} />
      </div>
      <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
    </div>
  );
}

function Separator({ className = '' }: { className?: string }) {
  return (
    <span className={`font-mono font-light text-white/30 select-none ${className}`}>:</span>
  );
}

function CurrentTime() {
  const timeFormat = useSettingsStore((s) => s.timeFormat);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, '0');
  let period = '';

  if (timeFormat === '12h') {
    period = hour >= 12 ? ' PM' : ' AM';
    hour = hour % 12 || 12;
  }

  const hourStr = String(hour).padStart(2, '0');

  return (
    <div dir="ltr" className="flex items-baseline justify-center gap-1">
      <div className="flex font-mono text-5xl font-extralight tabular-nums text-white/90">
        <AnimatedDigit value={hourStr[0] ?? '0'} />
        <AnimatedDigit value={hourStr[1] ?? '0'} />
      </div>
      <Separator className="text-4xl mb-0" />
      <div className="flex font-mono text-5xl font-extralight tabular-nums text-white/90">
        <AnimatedDigit value={minute[0] ?? '0'} />
        <AnimatedDigit value={minute[1] ?? '0'} />
      </div>
      {period && (
        <span className="ms-1 text-sm font-medium text-white/50">{period}</span>
      )}
    </div>
  );
}

export function CountdownTimer() {
  const { hours, minutes, seconds, nextPrayer, progressPercent } = useCountdown();
  const { t } = useTranslation();
  const dailyTimes = usePrayerStore((s) => s.dailyTimes);

  return (
    <motion.div
      className="rounded-2xl glass bg-white/5 px-6 py-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Current time — always visible */}
      <CurrentTime />

      {dailyTimes && nextPrayer ? (
        <>
          <div className="my-4 h-px bg-white/10" />

          <p className="mb-4 text-center text-xs uppercase tracking-widest text-white/40">
            {t('ui.nextPrayer')}: {t(`prayer.${nextPrayer}`)}
          </p>

          {/* Countdown digits */}
          <div dir="ltr" className="flex items-end justify-center gap-2">
            <TimeSegment value={hours} label={t('ui.hours')} />
            <Separator className="mb-4 text-3xl" />
            <TimeSegment value={minutes} label={t('ui.minutes')} />
            <Separator className="mb-4 text-3xl" />
            <TimeSegment value={seconds} label={t('ui.seconds')} />
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white/40 transition-[width] duration-1000 linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-center text-sm text-white/40">
          {t('ui.loading')}
        </p>
      )}
    </motion.div>
  );
}
