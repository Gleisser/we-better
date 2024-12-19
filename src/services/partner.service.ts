import { apiClient } from '@/lib/api-client';
import { PartnerResponse } from '@/types/partner';

export const partnerService = {
  async getPartners(): Promise<PartnerResponse> {
    const populateQuery = 'populate=brands.logo.img';
    const { data } = await apiClient.get<PartnerResponse>(`/partner?${populateQuery}`);
    return data;
  },
}; 