import { RefObject, useEffect, useState } from 'react';

type UseElementVisibilityOptions = IntersectionObserverInit & {
  disabled?: boolean;
};

export const useElementVisibility = <T extends Element>(
  ref: RefObject<T>,
  options?: UseElementVisibilityOptions
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (options?.disabled) {
      setIsVisible(false);
      return;
    }

    const target = ref.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const nextEntry = entries[0];
        setIsVisible(Boolean(nextEntry?.isIntersecting));
      },
      {
        root: options?.root,
        rootMargin: options?.rootMargin,
        threshold: options?.threshold,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options?.disabled, options?.root, options?.rootMargin, options?.threshold, ref]);

  return isVisible;
};

export default useElementVisibility;
