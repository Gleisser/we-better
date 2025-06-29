import { createQueryHook } from './utils/createQueryHook';
import { galleryService } from '@/core/services/gallery.service';
import { GalleryResponse } from '@/utils/types/gallery';

export const GALLERY_QUERY_KEY = ['gallery'] as const;

const {
  useQueryHook: useGallery,
  prefetchData: prefetchGallery,
  invalidateCache: invalidateGalleryCache,
} = createQueryHook<GalleryResponse>({
  queryKey: GALLERY_QUERY_KEY,
  queryFn: () => galleryService.getGallery(),
});

export { useGallery, prefetchGallery, invalidateGalleryCache };
