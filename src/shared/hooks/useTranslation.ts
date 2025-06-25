import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/core/i18n';
import { i18n } from 'i18next';

/**
 * Custom hook for translations using react-i18next
 * Provides a simpler interface for common translation operations
 */
export const useTranslation = (
  namespace?: string
): {
  t: (key: string, options?: Record<string, unknown>) => string | string[];
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  const changeLanguage = async (lng: SupportedLanguage): Promise<void> => {
    try {
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLanguage = i18n.language as SupportedLanguage;
  const isLoading = !ready;

  // Helper function for translations with fallback
  const translate = (key: string, options?: Record<string, unknown>): string | string[] => {
    try {
      const result = t(key, options);
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return key; // Return the key as fallback
    }
  };

  return {
    t: translate,
    changeLanguage,
    currentLanguage,
    isLoading,
    isReady: ready,
    i18n, // Expose i18n instance for advanced usage
  };
};

/**
 * Hook specifically for common translations (most frequently used)
 */
export const useCommonTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string | string[];
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('common');
};

/**
 * Hook specifically for auth translations
 */
export const useAuthTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string | string[];
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('auth');
};

/**
 * Hook specifically for error translations
 */
export const useErrorTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string | string[];
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('errors');
};
