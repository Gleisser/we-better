export interface Video {
  id: string;
  title: string;
  category: 'Mindfulness' | 'Productivity' | 'Health' | 'Leadership' | 'Personal Growth';
  subCategory?: string;
  thumbnail: string;
  rating: number;
  duration: string;
  youtubeId: string;
  author: string;
  views?: string;
} 