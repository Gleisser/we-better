import { startTransition, useEffect, useState } from 'react';

interface UseIdleActivationOptions {
  enabled?: boolean;
  minimumDelay?: number;
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
  minimumDelay = 0,
  timeout = 2000,
  fallbackDelay = 1200,
}: UseIdleActivationOptions = {}): boolean {
  const [isActive, setIsActive] = useState(() => typeof window === 'undefined' || !enabled);
  const [isDelaySatisfied, setIsDelaySatisfied] = useState(
    () => typeof window === 'undefined' || !enabled || minimumDelay <= 0
  );

  useEffect(() => {
    if (!enabled) {
      setIsDelaySatisfied(true);
      return;
    }

    if (minimumDelay <= 0) {
      setIsDelaySatisfied(true);
      return;
    }

    setIsDelaySatisfied(false);

    const timeoutHandle = window.setTimeout(() => {
      startTransition(() => {
        setIsDelaySatisfied(true);
      });
    }, minimumDelay);

    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, [enabled, minimumDelay]);

  useEffect(() => {
    if (!enabled || isActive || !isDelaySatisfied) {
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
  }, [enabled, fallbackDelay, isActive, isDelaySatisfied, timeout]);

  return isActive;
}
