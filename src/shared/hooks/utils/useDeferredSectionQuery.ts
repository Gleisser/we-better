import { RefObject, useEffect, useState } from 'react';

interface UseDeferredSectionQueryOptions {
  rootMargin?: string;
  threshold?: number;
}

export function useDeferredSectionQuery<T extends Element>(
  targetRef: RefObject<T | null>,
  options: UseDeferredSectionQueryOptions = {}
): boolean {
  const { rootMargin = '300px 0px', threshold = 0.01 } = options;
  const [enabled, setEnabled] = useState(() => typeof window === 'undefined');

  useEffect(() => {
    if (enabled) {
      return;
    }

    const target = targetRef.current;

    if (!target || typeof IntersectionObserver === 'undefined') {
      setEnabled(true);
      return;
    }

    let observer: IntersectionObserver | null = null;

    observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setEnabled(true);
          observer?.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);

    return () => {
      observer?.disconnect();
    };
  }, [enabled, rootMargin, targetRef, threshold]);

  return enabled;
}
