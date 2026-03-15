import { startTransition, useEffect, useState } from 'react';

interface UseIdleActivationOptions {
  enabled?: boolean;
  timeout?: number;
  fallbackDelay?: number;
}

type IdleCallbackHandle = number;

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

export function useIdleActivation({
  enabled = true,
  timeout = 2000,
  fallbackDelay = 1200,
}: UseIdleActivationOptions = {}): boolean {
  const [isActive, setIsActive] = useState(() => typeof window === 'undefined' || !enabled);

  useEffect(() => {
    if (!enabled || isActive) {
      return;
    }

    const idleWindow = window as IdleWindow;
    const activate = (): void => {
      startTransition(() => {
        setIsActive(true);
      });
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(
        () => {
          activate();
        },
        { timeout }
      );

      return () => {
        idleWindow.cancelIdleCallback?.(handle);
      };
    }

    const timeoutHandle = window.setTimeout(() => {
      activate();
    }, fallbackDelay);

    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, [enabled, fallbackDelay, isActive, timeout]);

  return isActive;
}
