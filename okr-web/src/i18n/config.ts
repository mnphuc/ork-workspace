'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viTranslation from './locales/vi/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
  vi: {
    translation: viTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Set default language to English to prevent hydration issues
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    // Prevent hydration issues by ensuring consistent language
    react: {
      useSuspense: false,
    },
  });

export default i18n;
