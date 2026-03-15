import { useEffect, useMemo, useState, type ReactNode } from 'react';
import i18n, { type AppNamespace } from '@/core/i18n';
import RouteLoader from './RouteLoader';

interface RouteNamespaceBoundaryProps {
  children: ReactNode;
  namespaces?: readonly AppNamespace[];
  label?: string;
  variant?: 'fullscreen' | 'content';
}

const getActiveLanguage = (): string => {
  return i18n.resolvedLanguage || i18n.language || 'en';
};

const normalizeNamespaces = (namespaces: readonly AppNamespace[] = []): AppNamespace[] => {
  return Array.from(new Set<AppNamespace>(['common', ...namespaces]));
};

const hasLoadedNamespaces = (namespaces: readonly AppNamespace[]): boolean => {
  return namespaces.every(namespace => i18n.hasLoadedNamespace(namespace));
};

const RouteNamespaceBoundary = ({
  children,
  namespaces = [],
  label,
  variant = 'fullscreen',
}: RouteNamespaceBoundaryProps): JSX.Element => {
  const requiredNamespaces = useMemo(() => normalizeNamespaces(namespaces), [namespaces]);
  const [activeLanguage, setActiveLanguage] = useState(() => getActiveLanguage());
  const [isReady, setIsReady] = useState(() => hasLoadedNamespaces(requiredNamespaces));

  useEffect(() => {
    const handleLanguageChange = (): void => {
      setActiveLanguage(getActiveLanguage());
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const ensureNamespaces = async (): Promise<void> => {
      if (hasLoadedNamespaces(requiredNamespaces)) {
        if (!cancelled) {
          setIsReady(true);
        }
        return;
      }

      if (!cancelled) {
        setIsReady(false);
      }

      try {
        await i18n.loadNamespaces(requiredNamespaces as string[]);
      } catch (error) {
        console.error('Failed to load route namespaces:', error);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void ensureNamespaces();

    return () => {
      cancelled = true;
    };
  }, [activeLanguage, requiredNamespaces]);

  if (!isReady) {
    return <RouteLoader label={label} variant={variant} />;
  }

  return <>{children}</>;
};

export default RouteNamespaceBoundary;
