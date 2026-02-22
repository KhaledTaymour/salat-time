import { motion } from 'motion/react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { HijriAdjustment } from '@/types';

const OPTIONS: { value: HijriAdjustment; label: string }[] = [
  { value: -2, label: '−2' },
  { value: -1, label: '−1' },
  { value:  0, label: 'Auto' },
  { value:  1, label: '+1' },
  { value:  2, label: '+2' },
];

export function HijriAdjustmentControl() {
  const hijriAdjustment = useSettingsStore((s) => s.hijriAdjustment);
  const setHijriAdjustment = useSettingsStore((s) => s.setHijriAdjustment);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{t('settings.hijriAdjustment')}</span>
        {hijriAdjustment !== 0 && (
          <span className="text-xs text-amber-300/80">
            {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment} day
          </span>
        )}
      </div>

      {/* Pill row */}
      <div className="relative flex rounded-xl bg-white/5 p-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setHijriAdjustment(opt.value)}
            className="relative z-10 flex-1 rounded-[10px] py-2 text-center text-xs transition-colors"
            style={{
              color: hijriAdjustment === opt.value ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          >
            {hijriAdjustment === opt.value && (
              <motion.span
                layoutId="hijri-pill"
                className="absolute inset-0 rounded-[10px] bg-white/15"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-white/30">{t('settings.hijriAdjustmentHint')}</p>
    </div>
  );
}
