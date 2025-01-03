import { Brand } from "./features-response";
import { APIResponse } from "@/types/common/meta";

export interface Partner {
    documentId: string;
    id: number;
    title: string;
    brands: Brand[];
}

export type PartnerResponse = APIResponse<Partner>;