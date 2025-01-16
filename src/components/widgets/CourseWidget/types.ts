export type Platform = 'udemy' | 'coursera' | 'edx' | 'youtube';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  platform: Platform;
  thumbnail: string;
  instructor: string;
  rating: number;
  studentsCount: number;
  price: {
    current: number;
    original: number;
  };
  duration: string;
  level: DifficultyLevel;
  skills: string[];
  matchScore: number;
  description: string;
  lastUpdated: string;
}

export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
} 