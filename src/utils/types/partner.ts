import { Brand } from '@/utils/types/features-response';
import { APIResponse } from '@/utils/types/common/meta';

export interface Partner {
  documentId: string;
  id: number;
  title: string;
  brands: Brand[];
}

export type PartnerResponse = APIResponse<Partner>;
