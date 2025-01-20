export interface Course {
  id: string;
  title: string;
  instructor: string;
  platform: 'udemy' | 'coursera' | 'pluralsight';
  thumbnail: string;
  rating: number;
  studentsCount: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: {
    current: number;
    original: number;
  };
  skills: string[];
  description: string;
  url: string;
  category: string;
  subCategory: string;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Productivity & Time Management for the Overwhelmed',
    instructor: 'Josh Paulsen',
    platform: 'udemy',
    thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    rating: 4.6,
    studentsCount: 52100,
    duration: '3h 15m',
    level: 'beginner',
    price: {
      current: 14.99,
      original: 84.99,
    },
    skills: ['Time Management', 'Productivity', 'Goal Setting', 'Task Prioritization'],
    description: 'Master proven productivity techniques and time management strategies to overcome overwhelm and achieve more.',
    url: 'https://udemy.com/course/productivity',
    category: 'Personal Development',
    subCategory: 'Productivity'
  },
  {
    id: '2',
    title: 'The Science of Well-being',
    instructor: 'Dr. Sarah Thompson',
    platform: 'coursera',
    thumbnail: 'https://images.pexels.com/photos/3758104/pexels-photo-3758104.jpeg',
    rating: 4.9,
    studentsCount: 84300,
    duration: '4h 30m',
    level: 'beginner',
    price: {
      current: 49.99,
      original: 99.99,
    },
    skills: ['Happiness', 'Mental Health', 'Positive Psychology', 'Mindfulness'],
    description: 'Learn science-backed techniques to increase your happiness and build more productive habits.',
    url: 'https://coursera.org/well-being',
    category: 'Personal Development',
    subCategory: 'Mental Health'
  },
  {
    id: '3',
    title: 'Public Speaking Mastery',
    instructor: 'Michael Anderson',
    platform: 'udemy',
    thumbnail: 'https://images.pexels.com/photos/2173508/pexels-photo-2173508.jpeg',
    rating: 4.7,
    studentsCount: 32800,
    duration: '5h 45m',
    level: 'intermediate',
    price: {
      current: 19.99,
      original: 129.99,
    },
    skills: ['Public Speaking', 'Communication', 'Confidence', 'Presentation Skills'],
    description: 'Develop powerful public speaking skills and overcome stage fright with proven techniques.',
    url: 'https://udemy.com/public-speaking',
    category: 'Personal Development',
    subCategory: 'Communication'
  },
  {
    id: '4',
    title: 'Mindfulness Meditation for Beginners',
    instructor: 'Emma Wilson',
    platform: 'udemy',
    thumbnail: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
    rating: 4.8,
    studentsCount: 41200,
    duration: '2h 45m',
    level: 'beginner',
    price: {
      current: 12.99,
      original: 69.99,
    },
    skills: ['Meditation', 'Mindfulness', 'Stress Management', 'Mental Clarity'],
    description: 'Start your mindfulness journey with proven meditation techniques for stress reduction and mental clarity.',
    url: 'https://udemy.com/mindfulness',
    category: 'Personal Development',
    subCategory: 'Mindfulness'
  },
  {
    id: '5',
    title: 'Financial Intelligence: Personal Finance Mastery',
    instructor: 'Robert Chen',
    platform: 'coursera',
    thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
    rating: 4.7,
    studentsCount: 29400,
    duration: '6h 15m',
    level: 'intermediate',
    price: {
      current: 39.99,
      original: 199.99,
    },
    skills: ['Personal Finance', 'Investing', 'Budgeting', 'Financial Planning'],
    description: 'Master your personal finances with practical strategies for budgeting, investing, and wealth building.',
    url: 'https://coursera.org/finance',
    category: 'Personal Development',
    subCategory: 'Finance'
  }
]; 