export type VideoBadge = 'trending' | 'new' | null;

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  author: string;
  category: string;
  subCategory: string;
  rating: number;
  badge?: 'trending' | 'new';
  publishedAt: string;
  tags: string[];
}

export interface WatchProgress {
  progress: number; // 0 to 100
  lastWatched: Date;
} 