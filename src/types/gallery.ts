import { TopLevelImage } from '@/types/common/image';

export interface Gallery {
    documentId: string;
    id: number;
    title: string;
    highlightedTitle: string;
    images: TopLevelImage[];
}

export interface GalleryResponse {
    data: Gallery;
    meta: Record<string, unknown>;
}