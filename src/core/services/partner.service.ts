import { apiClient } from '@/core/services/api-client';
import { PartnerResponse } from '@/utils/types/partner';
import { handleServiceError } from '@/utils/helpers/service-utils';

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
