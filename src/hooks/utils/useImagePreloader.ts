import { useState, useCallback } from 'react';

interface UseImagePreloaderOptions {
  initialUrls?: string[];
  onError?: (error: unknown) => void;
}

interface UseImagePreloaderReturn {
  preloadImages: (urls: string[]) => Promise<void>;
  isLoading: boolean;
  failedUrls: string[];
}

export function useImagePreloader({ 
  initialUrls = [], 
  onError 
}: UseImagePreloaderOptions = {}): UseImagePreloaderReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(url);
      img.src = url;
    });
  }, []);

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    if (urls.length === 0 || isLoading) return;
    
    setIsLoading(true);
    setFailedUrls([]);

    try {
      await Promise.all(urls.map(async (url) => {
        try {
          await preloadImage(url);
        } catch (error) {
          setFailedUrls(prev => [...prev, url]);
          onError?.(error);
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, preloadImage, onError]);

  return {
    preloadImages,
    isLoading,
    failedUrls,
  };
} 