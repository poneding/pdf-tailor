import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

import en from './en.json';
import zhCN from './zh-CN.json';
import zhTW from './zh-TW.json';

export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface LanguageOption {
  code: Language;
  name: string;
}

const translations: Record<Language, TranslationDict> = {
  'en': en,
  'zh-CN': zhCN,
  'zh-TW': zhTW
};

const languageNames: Record<Language, string> = {
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文'
};

interface I18nContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getTranslations(lang: Language): TranslationDict {
  return translations[lang] || translations['en'];
}

function translate(dict: TranslationDict, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let result: string | TranslationDict = dict;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k] as TranslationDict;
    } else {
      return key;
    }
  }

  if (typeof result !== 'string') {
    return key;
  }

  const resultStr: string = result;

  if (params) {
    return resultStr.replace(/\{(\w+)\}/g, (_match: string, paramName: string) => {
      return paramName in params ? String(params[paramName]) : _match;
    });
  }

  return resultStr;
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('pdf-splitter-language');
    if (stored && translations[stored as Language]) {
      return stored as Language;
    }
    // 默认使用简体中文
    return 'zh-CN';
  });

  useEffect(() => {
    localStorage.setItem('pdf-splitter-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = useCallback((lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const dict = getTranslations(language);
    return translate(dict, key, params);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export function getSupportedLanguages(): LanguageOption[] {
  return [
    { code: 'en', name: languageNames['en'] },
    { code: 'zh-CN', name: languageNames['zh-CN'] },
    { code: 'zh-TW', name: languageNames['zh-TW'] }
  ];
}
