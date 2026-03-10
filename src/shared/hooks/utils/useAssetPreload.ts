import { useEffect, useMemo, useRef } from 'react';
import { useImagePreloader } from './useImagePreloader';
import { useLoadingState } from './useLoadingState';

interface UseAssetPreloadOptions {
  urls: string[];
  enabled?: boolean;
  minimumLoadingTime?: number;
  onError?: (error: unknown) => void;
}

interface UseAssetPreloadResult {
  isLoading: boolean;
  hasTimedOut: boolean;
}

export function useAssetPreload({
  urls,
  enabled = true,
  minimumLoadingTime = 500,
  onError,
}: UseAssetPreloadOptions): UseAssetPreloadResult {
  const { preloadImages } = useImagePreloader();
  const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime,
  });
  const lastLoadedKeyRef = useRef('');
  const inFlightKeyRef = useRef<string | null>(null);

  const normalizedUrls = useMemo(
    () => urls.filter((url): url is string => typeof url === 'string' && url.length > 0),
    [urls]
  );
  const urlsKey = useMemo(() => normalizedUrls.join('|'), [normalizedUrls]);

  useEffect(() => {
    if (!enabled || normalizedUrls.length === 0 || !urlsKey) {
      return;
    }

    if (lastLoadedKeyRef.current === urlsKey || inFlightKeyRef.current === urlsKey) {
      return;
    }

    let cancelled = false;

    const runPreload = async (): Promise<void> => {
      inFlightKeyRef.current = urlsKey;
      startLoading();

      try {
        await preloadImages(normalizedUrls);

        if (!cancelled) {
          lastLoadedKeyRef.current = urlsKey;
        }
      } catch (error) {
        onError?.(error);
      } finally {
        if (inFlightKeyRef.current === urlsKey) {
          inFlightKeyRef.current = null;
        }

        await stopLoading();
      }
    };

    void runPreload();

    return () => {
      cancelled = true;
    };
  }, [enabled, normalizedUrls, onError, preloadImages, startLoading, stopLoading, urlsKey]);

  return {
    isLoading,
    hasTimedOut,
  };
}
