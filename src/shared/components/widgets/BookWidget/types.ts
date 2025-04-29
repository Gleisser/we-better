export type BookCategory = 'mindfulness' | 'productivity' | 'leadership' | 'psychology' | 'self-help' | 'motivation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface Book {
  id: string;
  title: string;
  author: Author;
  thumbnail: string;
  description: string;
  rating: number;
  reviewsCount: number;
  price: {
    current: number;
    original: number;
  };
  pageCount: number;
  level: DifficultyLevel;
  category: BookCategory;
  topics: string[];
  matchScore: number;
  publishedAt: string;
  amazonUrl: string;
} 