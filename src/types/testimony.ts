import { TopLevelImage } from "./common/image";

export interface TestimonyItem {
    documentId: string;
    id: number;
    username: string;
    profilePic: TopLevelImage;
    testimony: string;
}

export interface Testimony {
    documentId: string;
    id: number;
    title: string;
    subtitle: string;
    testimonies: TestimonyItem[];
}

export type TestimonyResponse = {
    data: Testimony;
    meta: Record<string, unknown>;
}