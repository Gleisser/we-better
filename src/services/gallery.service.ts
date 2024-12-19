import { apiClient } from '@/lib/api-client';
import { GalleryResponse } from '@/types/gallery';

export const galleryService = {
  async getGallery(): Promise<GalleryResponse> {
    const populateQuery = 'populate=images';
    const { data } = await apiClient.get<GalleryResponse>(`/gallery?${populateQuery}`);
    return data;
  },
}; 