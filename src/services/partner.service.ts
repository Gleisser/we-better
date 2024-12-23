import { apiClient } from '@/lib/api-client';
import { PartnerResponse } from '@/types/partner';
import { handleServiceError } from '@/utils/service-utils';

export const partnerService = {
  async getPartners(): Promise<PartnerResponse> {
    try {
      const populateQuery = 'populate=brands.logo.img';
      const { data } = await apiClient.get<PartnerResponse>(`/partner?${populateQuery}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Partner');
    }
  },
}; 