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
  const loadingStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback(() => {
    if (isLoading) return; // Prevent multiple starts

    setIsLoading(true);
    setHasTimedOut(false);
    loadingStartTime.current = Date.now();

    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      setIsLoading(false);
      loadingStartTime.current = null;
    }, timeout);
  }, [timeout, isLoading]);

  const stopLoading = useCallback(async () => {
    if (!isLoading || !loadingStartTime.current) return; // Prevent unnecessary stops

    const loadingTime = Date.now() - loadingStartTime.current;
    const remainingTime = Math.max(0, minimumLoadingTime - loadingTime);

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    setIsLoading(false);
    setHasTimedOut(false);
    loadingStartTime.current = null;

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [minimumLoadingTime, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    hasTimedOut,
    startLoading,
    stopLoading,
  };
}
