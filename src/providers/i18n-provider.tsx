'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import es from '@/lib/translations/es.json';
import arn from '@/lib/translations/arn.json';

type Lang = 'es' | 'arn';
const translations = { es, arn };

interface I18nContextType {
  lang: Lang;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'es',
  t: (k: string) => k,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');

  useEffect(() => {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('arn')) setLang('arn');
  }, []);

  const t = (key: string): string => {
    return (translations[lang] as any)[key] || (translations.es as any)[key] || key;
  };

  return <I18nContext.Provider value={{ lang, t, setLang }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
