import { useQuery } from '@tanstack/react-query';
import { galleryService } from '@/services/gallery.service';

export const GALLERY_QUERY_KEY = ['gallery'] as const;

export function useGallery() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: () => galleryService.getGallery(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 