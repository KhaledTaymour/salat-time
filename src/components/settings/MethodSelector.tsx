import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { suggestMethod } from '@/utils/calculations';
import type { CalculationMethod } from '@/types';

const METHODS: CalculationMethod[] = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export function MethodSelector() {
  const method = useSettingsStore((s) => s.method);
  const location = useSettingsStore((s) => s.location);
  const setMethod = useSettingsStore((s) => s.setMethod);
  const { t } = useTranslation();

  const suggested = location ? suggestMethod(location.countryCode) : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-white/70">{t('settings.calculationMethod')}</span>
      <div className="max-h-48 overflow-y-auto rounded-xl bg-white/5 py-1">
        {METHODS.map((m) => {
          const isSelected = method === m;
          const isRecommended = suggested === m;
          return (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`w-full px-3 py-2 text-start text-xs transition-colors hover:bg-white/10
                ${isSelected ? 'text-white' : 'text-white/50'}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="line-clamp-1">{t(`method.${m}`)}</span>
                <span className="flex shrink-0 gap-1">
                  {isRecommended && (
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                      {t('settings.recommended')}
                    </span>
                  )}
                  {isSelected && (
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white/80">
                      ✓
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
