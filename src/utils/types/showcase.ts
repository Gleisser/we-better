import { ThumbnailImage } from '@/utils/types/common/image';
import { APIResponse } from '@/utils/types/common/meta';

export interface Belt {
  documentId: string;
  id: number;
  title: string;
  description: string;
  images: ThumbnailImage[];
}

export interface Showcase {
  documentId: string;
  id: number;
  title: string;
  subtitle: string;
  belts: Belt[];
}

export type ShowcaseResponse = APIResponse<Showcase>;
