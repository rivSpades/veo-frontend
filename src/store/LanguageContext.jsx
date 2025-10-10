import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import en from '../locales/en';
import pt from '../locales/pt';
import es from '../locales/es';

const LanguageContext = createContext();

const DICTS = { en, pt, es };
const STORAGE_KEY = 'veo-menu-language';

/**
 * LanguageProvider - Provides i18n context for the application
 * Supports: English (en), Portuguese (pt), Spanish (es)
 */
/**
 * Detect browser language
 * @returns {string} Language code (en, pt, es)
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();

  // Return if supported, otherwise default to English
  return DICTS[langCode] ? langCode : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    // 1. Try to load from localStorage (user's manual selection)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTS[saved]) {
      return saved;
    }

    // 2. Detect browser language
    const browserLang = detectBrowserLanguage();

    // Save browser-detected language to localStorage
    localStorage.setItem(STORAGE_KEY, browserLang);

    return browserLang;
  });

  const dict = useMemo(() => DICTS[language] || en, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang) => {
    if (DICTS[lang]) {
      setLanguageState(lang);
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      dict,
    }),
    [language, dict]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage - Hook to access language context
 * @returns {{ language: string, setLanguage: (lang: string) => void, dict: object }}
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * useTranslation - Hook for translating text
 * @param {string} prefix - Optional key prefix
 * @returns {{ t: (key: string, fallback?: string) => string }}
 */
export function useTranslation(prefix) {
  const { dict } = useLanguage();

  const t = (key, fallback) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return dict[fullKey] ?? fallback ?? fullKey;
  };

  return { t };
}
