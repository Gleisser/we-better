import { TopLevelImage } from "./common/image";

export interface Prefooter {
  id: number;
  documentId: string;
  title: string;
  buttonText: string;
  buttonDescription: string;
  image: TopLevelImage;
}

export interface PrefooterResponse {
    data: Prefooter;
    meta: Record<string, unknown>;
}