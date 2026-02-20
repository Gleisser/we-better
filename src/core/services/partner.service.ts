import { apiClient } from '@/core/services/api-client';
import { PartnerResponse } from '@/utils/types/partner';
import { handleServiceError } from '@/utils/helpers/service-utils';

const BFF_API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export const partnerService = {
  async getPartners(): Promise<PartnerResponse> {
    try {
      const populateQuery = 'populate=brands.logo.img';
      const { data } = await apiClient.get<PartnerResponse>(
        `${BFF_API_BASE_URL}/api/content/partner?${populateQuery}`
      );
      return data;
    } catch (error) {
      return handleServiceError(error, 'Partner');
    }
  },
};
