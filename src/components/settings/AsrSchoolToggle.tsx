import { motion } from 'motion/react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { AsrSchool } from '@/types';

const OPTIONS: { value: AsrSchool; key: 'school.shafii' | 'school.hanafi' }[] = [
  { value: 0, key: 'school.shafii' },
  { value: 1, key: 'school.hanafi' },
];

export function AsrSchoolToggle() {
  const school = useSettingsStore((s) => s.school);
  const setSchool = useSettingsStore((s) => s.setSchool);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-white/70">{t('settings.asrSchool')}</span>
      <div className="relative flex rounded-xl bg-white/5 p-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSchool(opt.value)}
            className="relative z-10 flex-1 rounded-[10px] py-2 text-center text-xs transition-colors"
            style={{ color: school === opt.value ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            {school === opt.value && (
              <motion.span
                layoutId="school-pill"
                className="absolute inset-0 rounded-[10px] bg-white/15"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{t(opt.key)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
