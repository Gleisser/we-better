import { TopLevelImage } from '@/utils/types/common/image';
import { APIResponse } from '@/utils/types/common/meta';

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

export type TestimonyResponse = APIResponse<Testimony>;
