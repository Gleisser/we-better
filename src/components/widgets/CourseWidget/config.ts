import { Platform, PlatformConfig } from './types';

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  udemy: {
    name: 'Udemy',
    icon: '🎓',
    color: '#A435F0',
    bgColor: 'rgba(164, 53, 240, 0.1)'
  },
  coursera: {
    name: 'Coursera',
    icon: '📚',
    color: '#0056D2',
    bgColor: 'rgba(0, 86, 210, 0.1)'
  },
  edx: {
    name: 'edX',
    icon: '🎯',
    color: '#02262B',
    bgColor: 'rgba(2, 38, 43, 0.1)'
  },
  youtube: {
    name: 'YouTube',
    icon: '🎥',
    color: '#FF0000',
    bgColor: 'rgba(255, 0, 0, 0.1)'
  }
};

export const MOCK_COURSES = [
  {
    id: 'course_1',
    title: 'Advanced React Patterns & Best Practices',
    platform: 'udemy' as Platform,
    thumbnail: '/assets/images/courses/react-patterns.jpg',
    instructor: 'Sarah Developer',
    rating: 4.8,
    studentsCount: 12500,
    price: {
      current: 29.99,
      original: 199.99,
    },
    duration: '22h 30m',
    level: 'intermediate',
    skills: ['React', 'TypeScript', 'Performance'],
    matchScore: 92,
    description: 'Master advanced React patterns and learn to build scalable and maintainable applications.',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'course_2',
    title: 'Machine Learning A-Z: Hands-On Python & R',
    platform: 'coursera' as Platform,
    thumbnail: '/assets/images/courses/ml-course.jpg',
    instructor: 'Dr. Angela Yu',
    rating: 4.9,
    studentsCount: 45000,
    price: {
      current: 79.99,
      original: 199.99,
    },
    duration: '44h 15m',
    level: 'beginner',
    skills: ['Python', 'Machine Learning', 'Data Science'],
    matchScore: 88,
    description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.',
    lastUpdated: '2024-03-10'
  }
]; 