import { ThumbnailImage } from '@/types/common/image';

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

export interface ShowcaseResponse {
    data: Showcase;
    meta: Record<string, unknown>;
}