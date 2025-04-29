import { APIResponse } from '@/types/common/meta';

export interface Link {
    documentId: string;
    id: number;
    title: string;
    url: string;
}

export interface Brand {
    documentId: string;
    id: number;
    name: string;
    logo: BrandLogo;
}

export interface BrandLogo {
    img: {
        url: string;
    };
}

export interface Card {
    documentId: string;
    id: number;
    title: string;
    Description: string;
    link: Link;
}

export interface Features {
    documentId: string;
    id: number;
    title: string;
    subtext: string;
    cards: Card[];
    brands: Brand[];
}

export type FeaturesResponse = APIResponse<Features>; 