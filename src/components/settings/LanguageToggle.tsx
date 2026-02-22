import { motion } from 'motion/react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/types';

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ar', label: 'ع' },
];

export function LanguageToggle() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70">{t('settings.language')}</span>
      <div className="relative flex rounded-full bg-white/10 p-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLanguage(opt.value)}
            className="relative z-10 rounded-full px-3 py-1 text-sm font-medium transition-colors"
            style={{ color: language === opt.value ? '#fff' : 'rgba(255,255,255,0.5)' }}
          >
            {language === opt.value && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-white/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
