import { Image } from '@/types/common/image';

export interface Slide {
    documentId: string;
    id: number;
    title: string;
    image: Image;
}

export interface Highlight {
    documentId: string;
    id: number;
    title: string;
    slides: Slide[];
}

export interface HighlightResponse {
    data: Highlight;
    meta: Record<string, unknown>;
} 