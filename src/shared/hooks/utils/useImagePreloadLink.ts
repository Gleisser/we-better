import { useEffect } from 'react';
import type { ResponsiveMediaSource } from '@/utils/types/responsiveMedia';

export const useImagePreloadLink = (
  media: ResponsiveMediaSource | null,
  options: { enabled?: boolean; id?: string } = {}
): void => {
  const { enabled = true, id = 'landing-hero-image-preload' } = options;

  useEffect(() => {
    if (!enabled || !media?.src) {
      return;
    }

    const existing = document.head.querySelector<HTMLLinkElement>(`link[data-preload-id="${id}"]`);

    if (existing) {
      existing.remove();
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = media.src;
    link.setAttribute('data-preload-id', id);

    if (media.srcSet) {
      link.setAttribute('imagesrcset', media.srcSet);
    }

    if (media.sizes) {
      link.setAttribute('imagesizes', media.sizes);
    }

    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [enabled, id, media?.sizes, media?.src, media?.srcSet]);
};

export default useImagePreloadLink;
