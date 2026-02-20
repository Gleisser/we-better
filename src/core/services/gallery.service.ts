import { apiClient } from '@/core/services/api-client';
import { GalleryResponse } from '@/utils/types/gallery';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const galleryService = {
  async getGallery(): Promise<GalleryResponse> {
    try {
      const populateQuery = 'populate=images';
      const { data } = await apiClient.get<GalleryResponse>(
        `${BFF_API_BASE_URL}/api/content/gallery?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Gallery');
    }
  },
};
