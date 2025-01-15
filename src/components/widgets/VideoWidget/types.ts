export type VideoBadge = 'trending' | 'new' | null;

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  author: string;
  duration: string;
  views: string;
  rating: number;
  category: string;
  subCategory: string;
  badge?: VideoBadge;
}

export interface WatchProgress {
  progress: number; // 0 to 100
  lastWatched: Date;
} 