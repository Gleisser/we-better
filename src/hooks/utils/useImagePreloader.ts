import { useState, useEffect } from 'react';

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

  const preloadImage = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => reject(url);
    });
  };

  const preloadImages = async (urls: string[]): Promise<void> => {
    setIsLoading(true);
    setFailedUrls([]);

    try {
      await Promise.all(
        urls.map(async (url) => {
          try {
            await preloadImage(url);
          } catch (error) {
            setFailedUrls((prev) => [...prev, url]);
            onError?.(error);
          }
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrls.length > 0) {
      preloadImages(initialUrls);
    }
  }, []); // Only run on mount for initial URLs

  return {
    preloadImages,
    isLoading,
    failedUrls,
  };
} 