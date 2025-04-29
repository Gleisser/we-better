import { apiClient } from '@/lib/api-client';
import { GalleryResponse } from '@/types/gallery';
import { handleServiceError } from '@/utils/service-utils';
export const galleryService = {
  async getGallery(): Promise<GalleryResponse> {
    try {
      const populateQuery = 'populate=images';
      const { data } = await apiClient.get<GalleryResponse>(`/gallery?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Gallery');
    }
  },
}; 