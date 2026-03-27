import { useEffect, useState } from 'react';

const getIsPageVisible = (): boolean =>
  typeof document === 'undefined' || document.visibilityState !== 'hidden';

export const usePageVisibility = (): boolean => {
  const [isPageVisible, setIsPageVisible] = useState(getIsPageVisible);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const updateVisibility = (): void => {
      setIsPageVisible(document.visibilityState !== 'hidden');
    };

    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);

    return () => {
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return isPageVisible;
};

export default usePageVisibility;
