import { useState, useCallback, useRef, useEffect } from 'react';

interface UseLoadingStateOptions {
  timeout?: number;
  minimumLoadingTime?: number;
}

interface UseLoadingStateResult {
  isLoading: boolean;
  hasTimedOut: boolean;
  startLoading: () => void;
  stopLoading: () => Promise<void>;
}

export function useLoadingState({
  timeout = 30000,
  minimumLoadingTime = 500,
}: UseLoadingStateOptions = {}): UseLoadingStateResult {
  const [isLoading, setIsLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const isMountedRef = useRef(true);
  const loadingCountRef = useRef(0);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopDelayResolveRef = useRef<(() => void) | null>(null);

  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearStopDelay = useCallback(() => {
    if (stopDelayRef.current) {
      clearTimeout(stopDelayRef.current);
      stopDelayRef.current = null;
    }

    if (stopDelayResolveRef.current) {
      stopDelayResolveRef.current();
      stopDelayResolveRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    clearStopDelay();
    loadingCountRef.current += 1;
    setHasTimedOut(false);

    if (loadingCountRef.current === 1) {
      loadingStartTimeRef.current = Date.now();
      setIsLoading(true);
    }

    clearLoadingTimeout();
    timeoutRef.current = setTimeout(() => {
      loadingCountRef.current = 0;
      loadingStartTimeRef.current = null;
      clearStopDelay();

      if (isMountedRef.current) {
        setIsLoading(false);
        setHasTimedOut(true);
      }
    }, timeout);
  }, [clearLoadingTimeout, clearStopDelay, timeout]);

  const stopLoading = useCallback(async () => {
    if (loadingCountRef.current === 0) {
      return;
    }

    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    if (loadingCountRef.current > 0) {
      return;
    }

    clearLoadingTimeout();

    const loadingTime = loadingStartTimeRef.current
      ? Date.now() - loadingStartTimeRef.current
      : minimumLoadingTime;
    const remainingTime = Math.max(0, minimumLoadingTime - loadingTime);

    await new Promise<void>(resolve => {
      stopDelayResolveRef.current = resolve;
      stopDelayRef.current = setTimeout(() => {
        stopDelayRef.current = null;
        stopDelayResolveRef.current = null;
        loadingStartTimeRef.current = null;

        if (isMountedRef.current) {
          setIsLoading(false);
          setHasTimedOut(false);
        }

        resolve();
      }, remainingTime);
    });
  }, [clearLoadingTimeout, minimumLoadingTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearLoadingTimeout();
      clearStopDelay();
    };
  }, [clearLoadingTimeout, clearStopDelay]);

  return {
    isLoading,
    hasTimedOut,
    startLoading,
    stopLoading,
  };
}
