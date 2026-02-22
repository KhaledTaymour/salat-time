import { motion } from 'motion/react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { TimeFormat } from '@/types';

const OPTIONS: { value: TimeFormat; labelKey: 'settings.timeFormat12h' | 'settings.timeFormat24h' }[] = [
  { value: '24h', labelKey: 'settings.timeFormat24h' },
  { value: '12h', labelKey: 'settings.timeFormat12h' },
];

export function TimeFormatToggle() {
  const timeFormat = useSettingsStore((s) => s.timeFormat);
  const setTimeFormat = useSettingsStore((s) => s.setTimeFormat);
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70">{t('settings.timeFormat')}</span>
      <div className="relative flex rounded-full bg-white/10 p-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeFormat(opt.value)}
            className="relative z-10 rounded-full px-3 py-1 text-sm font-medium transition-colors"
            style={{ color: timeFormat === opt.value ? '#fff' : 'rgba(255,255,255,0.5)' }}
          >
            {timeFormat === opt.value && (
              <motion.span
                layoutId="timeformat-pill"
                className="absolute inset-0 rounded-full bg-white/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{t(opt.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
