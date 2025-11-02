import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enDashboard from '@/locales/en/dashboard.json';
import enErrors from '@/locales/en/errors.json';

import esCommon from '@/locales/es/common.json';
import esAuth from '@/locales/es/auth.json';
import esDashboard from '@/locales/es/dashboard.json';
import esErrors from '@/locales/es/errors.json';

import faCommon from '@/locales/fa/common.json';
import faAuth from '@/locales/fa/auth.json';
import faDashboard from '@/locales/fa/dashboard.json';
import faErrors from '@/locales/fa/errors.json';

export const supportedLanguages = ['en', 'es', 'fa'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        errors: enErrors,
      },
      es: {
        common: esCommon,
        auth: esAuth,
        dashboard: esDashboard,
        errors: esErrors,
      },
      fa: {
        common: faCommon,
        auth: faAuth,
        dashboard: faDashboard,
        errors: faErrors,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'errors'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
