import { motion } from 'motion/react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrayerStore } from '@/stores/prayerStore';
import { formatHijriDate, formatGregorianDate } from '@/utils/date';

interface HeaderProps {
  onSettingsOpen: () => void;
}

export function Header({ onSettingsOpen }: HeaderProps) {
  const { t, language } = useTranslation();
  const dailyTimes = usePrayerStore((s) => s.dailyTimes);

  return (
    <motion.header
      className="flex items-start justify-between px-4 pt-6 pb-2"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">
          {language === 'ar' ? 'وقت الصلاة' : 'Salat Time'}
        </h1>
        {dailyTimes ? (
          <>
            <p className="text-sm text-white/60">
              {formatGregorianDate(dailyTimes.gregorian, language)}
            </p>
            <p className="text-xs text-white/40">
              {formatHijriDate(dailyTimes.hijri, language)}
            </p>
          </>
        ) : (
          <p className="text-sm text-white/40">{t('ui.loading')}</p>
        )}
      </div>

      <button
        onClick={onSettingsOpen}
        className="mt-1 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90 active:scale-95"
        aria-label={t('settings.title')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </motion.header>
  );
}
