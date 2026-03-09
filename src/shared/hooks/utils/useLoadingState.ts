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
  const [loadingCount, setLoadingCount] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isLoading = loadingCount > 0;

  const startLoading = useCallback(() => {
    setLoadingCount(prev => prev + 1);
    setHasTimedOut(false);

    // Only set start time if it's the first loading request
    if (!loadingStartTime.current) {
      loadingStartTime.current = Date.now();
    }

    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout that clears everything if hit
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      setLoadingCount(0);
      loadingStartTime.current = null;
    }, timeout);
  }, [timeout]);

  const stopLoading = useCallback(async () => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);

      // If we've reached 0, clean up
      if (newCount === 0 && loadingStartTime.current) {
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Delay returning if minimumTime hasn't been reached
        const checkMinimumTime = async (): Promise<void> => {
          const loadingTime = Date.now() - (loadingStartTime.current ?? Date.now());
          const remainingTime = Math.max(0, minimumLoadingTime - loadingTime);

          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }

          loadingStartTime.current = null;
          setHasTimedOut(false);
        };

        checkMinimumTime();

        // This won't block the state update (which is immediate), but ensures
        // the external caller waits if they await stopLoading()
        return newCount;
      }

      return newCount;
    });

    // Perform the actual wait to satisfy the return promise
    if (loadingStartTime.current && loadingCount === 1) {
      const loadingTime = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, minimumLoadingTime - loadingTime);

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      loadingStartTime.current = null;
    }
  }, [minimumLoadingTime, loadingCount]);

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
