import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  pt: {
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const APP_NAMESPACES = [
  'common',
  'landing',
  'auth',
  'dashboard',
  'life-wheel',
  'dream-board',
  'missions',
  'settings',
  'bookmarks',
  'notifications',
  'pricing',
  'errors',
] as const;

export type AppNamespace = (typeof APP_NAMESPACES)[number];

const isI18nDebugEnabled = import.meta.env.DEV && import.meta.env.VITE_I18N_DEBUG === 'true';

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    debug: isI18nDebugEnabled,
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    nonExplicitSupportedLngs: false,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'we-better-language',
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false,
    },
    saveMissing: isI18nDebugEnabled,
    missingKeyHandler: isI18nDebugEnabled
      ? (lng, ns, key) => {
          console.warn(`Missing translation key: ${lng}.${ns}.${key}`);
        }
      : undefined,
  });

export default i18n;
