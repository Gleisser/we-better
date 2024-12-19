export interface Community {
    documentId: string;
    id: number;
    title: string;
    label: string;
    buttonText: string;
}

export interface CommunityResponse {
    data: Community;
    meta: Record<string, unknown>;
}