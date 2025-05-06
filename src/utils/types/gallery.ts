import { TopLevelImage } from '@/utils/types/common/image';

export interface Gallery {
  documentId: string;
  id: number;
  Title: string;
  highlightedTitle: string;
  images: TopLevelImage[];
}

export interface GalleryResponse {
  data: Gallery;
  meta: Record<string, unknown>;
}
