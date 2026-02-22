import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Language, TranslationKeys } from '@/types';

type Translations = Record<string, string>;

const cache: Partial<Record<Language, Translations>> = {};

async function loadTranslations(language: Language): Promise<Translations> {
  if (cache[language]) return cache[language]!;
  const response = await fetch(`/locales/${language}.json`);
  if (!response.ok) throw new Error(`Failed to load ${language} translations`);
  const data = (await response.json()) as Translations;
  cache[language] = data;
  return data;
}

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    loadTranslations(language)
      .then(setTranslations)
      .catch(console.error);
  }, [language]);

  function t(key: keyof TranslationKeys): string {
    return translations[key] ?? key;
  }

  return {
    t,
    language,
    isRTL: language === 'ar',
  };
}
