import { APIResponse } from '@/utils/types/common/meta';
import { TopLevelImage } from './common/image';

export interface HeroImage {
  id: number;
  documentId: string;
  src: string;
  alt: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  img: TopLevelImage;
}

export interface Hero {
  id: number;
  documentId: string;
  title: string;
  subtitle: string;
  cta_text: string;
  secondary_cta_text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  images: HeroImage[];
  main_image_mobile: HeroImage;
  main_image: HeroImage;
}

export type HeroResponse = APIResponse<Hero>;
