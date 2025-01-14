export interface Video {
  id: string;
  title: string;
  category: 'Mindfulness' | 'Productivity' | 'Health' | 'Leadership' | 'Personal Growth';
  subCategory?: string;
  youtubeId: string;
  rating: number;
  duration: string;
  author: string;
  views?: string;
  previewUrl?: string;
}

export interface WatchProgress {
  progress: number; // 0 to 100
  lastWatched: Date;
} 