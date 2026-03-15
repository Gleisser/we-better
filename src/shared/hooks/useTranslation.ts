import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/core/i18n';
import { i18n } from 'i18next';

type Namespace = string | string[] | undefined;

const humanizeKey = (key: string): string => {
  const segment = key.split(':').pop()?.split('.').pop() ?? key;
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, character => character.toUpperCase());
};

const normalizeNamespaces = (namespace: Namespace, i18nInstance: i18n): string[] => {
  const explicitNamespaces =
    typeof namespace === 'string'
      ? [namespace]
      : Array.isArray(namespace)
        ? namespace
        : i18nInstance.options.defaultNS
          ? [String(i18nInstance.options.defaultNS)]
          : [];

  return Array.from(new Set(['common', ...explicitNamespaces]));
};

/**
 * Custom hook for translations using react-i18next
 * Provides a simpler interface for common translation operations
 */
export const useTranslation = (
  namespace?: string | string[]
): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  const { t, i18n, ready } = useI18nTranslation(namespace);
  const namespaceSignature = useMemo(() => {
    if (typeof namespace === 'string') {
      return namespace;
    }

    if (Array.isArray(namespace)) {
      return namespace.join('|');
    }

    return '__default__';
  }, [namespace]);
  const translationFnRef = useRef(t);
  const i18nRef = useRef(i18n);
  const namespaceRef = useRef<Namespace>(namespace);

  useEffect(() => {
    translationFnRef.current = t;
  }, [t]);

  useEffect(() => {
    i18nRef.current = i18n;
  }, [i18n]);

  useEffect(() => {
    namespaceRef.current = namespace;
  }, [namespaceSignature, namespace]);

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
  const translate = useCallback((key: string, options?: Record<string, unknown>): string => {
    try {
      const currentI18n = i18nRef.current;
      const currentNamespace = namespaceRef.current;

      if (!key.includes(':')) {
        for (const ns of normalizeNamespaces(currentNamespace, currentI18n)) {
          if (currentI18n.exists(key, { ns })) {
            const resolved = currentI18n.t(key, { ...options, ns });
            if (typeof resolved === 'string') {
              return resolved;
            }
          }
        }
      }

      const result = translationFnRef.current(key, options);
      return typeof result === 'string' && result !== key ? result : humanizeKey(key);
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return humanizeKey(key);
    }
  }, []);

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
  t: (key: string, options?: Record<string, unknown>) => string;
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
  t: (key: string, options?: Record<string, unknown>) => string;
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
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('errors');
};

/**
 * Hook specifically for Dream Board translations
 */
export const useDreamBoardTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('dream-board');
};

/**
 * Hook specifically for dashboard translations
 */
export const useDashboardTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('dashboard');
};

/**
 * Hook specifically for missions translations
 */
export const useMissionsTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('missions');
};

/**
 * Hook specifically for settings translations
 */
export const useSettingsTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('settings');
};

/**
 * Hook specifically for bookmarks translations
 */
export const useBookmarksTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('bookmarks');
};

/**
 * Hook specifically for notifications translations
 */
export const useNotificationsTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation('notifications');
};

/**
 * Hook specifically for life wheel translations
 */
export const useLifeWheelTranslation = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: SupportedLanguage) => Promise<void>;
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  isReady: boolean;
  i18n: i18n;
} => {
  return useTranslation(['dashboard', 'life-wheel']);
};
