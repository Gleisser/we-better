import { TopLevelImage } from "./common/image";
import { APIResponse, Meta } from "./common/meta";

// Base interface for timestamps
interface TimeStamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Main prefooter interface
export interface Prefooter extends TimeStamps {
  id: number;
  documentId: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonDescription: string;
  image: TopLevelImage;
}

// API response wrapper
export type PrefooterResponse = APIResponse<Prefooter>;
