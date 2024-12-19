import { Brand } from "./features-response";

export interface Partner {
    documentId: string;
    id: number;
    title: string;
    brands: Brand[];
}

export interface PartnerResponse {
    data: Partner;
    meta: Record<string, unknown>;
}