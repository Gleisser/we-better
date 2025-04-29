import { TopLevelImage } from '@/types/common/image';
import { APIResponse, Meta } from '@/types/common/meta';

// Base interface for timestamps
interface TimeStamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Slide interface
export interface Slide extends TimeStamps {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  image: {
    img: TopLevelImage;
    alt?: string;
  };
}

// Main highlight interface
export interface Highlight extends TimeStamps {
  id: number;
  documentId: string;
  title: string;
  subtitle?: string;
  slides: Slide[];
}

// API response wrapper
export type HighlightResponse = APIResponse<Highlight>;
