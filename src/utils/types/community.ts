import { APIResponse } from '@/shared/types/common/meta';

export interface Community {
  documentId: string;
  id: number;
  title: string;
  label: string;
  buttonText: string;
}

export type CommunityResponse = APIResponse<Community>;
