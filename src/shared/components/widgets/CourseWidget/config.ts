import { UdemyIcon, CourseraIcon, EdxIcon, SkillshareIcon, PluralsightIcon, LinkedInIcon } from '@/shared/components/common/icons';

export const PLATFORM_CONFIG = {
  udemy: {
    name: 'Udemy',
    bgColor: 'rgba(183, 37, 85, 0.15)',
    color: '#b72555'
  },
  coursera: {
    name: 'Coursera',
    bgColor: 'rgba(51, 121, 194, 0.15)',
    color: '#3379c2'
  },
  edx: {
    name: 'edX',
    bgColor: 'rgba(2, 0, 36, 0.15)',
    color: '#020024'
  },
  skillshare: {
    name: 'Skillshare',
    bgColor: 'rgba(0, 0, 0, 0.15)',
    color: '#000000'
  },
  pluralsight: {
    name: 'Pluralsight',
    bgColor: 'rgba(236, 0, 140, 0.15)',
    color: '#ec008c'
  },
  linkedin: {
    name: 'LinkedIn Learning',
    bgColor: 'rgba(0, 119, 181, 0.15)',
    color: '#0077b5'
  }
} as const;

export type PlatformType = keyof typeof PLATFORM_CONFIG;

export const MOCK_COURSES = [
  {
    id: 'course_1',
    title: 'Productivity & Time Management for the Overwhelmed',
    platform: 'udemy',
    thumbnail: '/assets/images/courses/productivity-course.jpg',
    instructor: 'Josh Paulsen',
    rating: 4.6,
    studentsCount: 52149,
    price: {
      current: 14.99,
      original: 84.99,
    },
    duration: '3h 15m',
    level: 'beginner',
    skills: [
      'Time Management',
      'Productivity',
      'Goal Setting',
      'Work-Life Balance',
      'Stress Management'
    ],
    matchScore: 95,
    description: 'Master proven productivity techniques to reduce stress, increase focus, and get more done in less time.',
    lastUpdated: '2024-02-15',
    url: 'https://www.udemy.com/course/productivity-and-time-management/'
  },
  {
    id: 'course_2',
    title: 'Mindfulness & Meditation: A Complete Guide to Inner Peace',
    platform: 'coursera',
    thumbnail: '/assets/images/courses/mindfulness-course.jpg',
    instructor: 'Dr. Sarah Williams',
    rating: 4.8,
    studentsCount: 34750,
    price: {
      current: 29.99,
      original: 99.99,
    },
    duration: '6h 30m',
    level: 'beginner',
    skills: [
      'Mindfulness',
      'Meditation',
      'Stress Reduction',
      'Emotional Balance',
      'Mental Clarity'
    ],
    matchScore: 88,
    description: 'Learn practical mindfulness techniques and meditation practices for reducing stress and finding inner peace.',
    lastUpdated: '2024-03-01',
    url: 'https://www.coursera.org/learn/mindfulness-meditation'
  },
  {
    id: 'course_3',
    title: 'The Science of Well-being & Happiness',
    platform: 'edx',
    thumbnail: '/assets/images/courses/wellbeing-course.jpg',
    instructor: 'Prof. Lauren Santos',
    rating: 4.9,
    studentsCount: 45200,
    price: {
      current: 49.99,
      original: 149.99,
    },
    duration: '10h 45m',
    level: 'intermediate',
    skills: [
      'Positive Psychology',
      'Habit Formation',
      'Mental Health',
      'Life Satisfaction',
      'Personal Growth'
    ],
    matchScore: 92,
    description: 'Discover scientifically-proven strategies for increasing happiness and building a more fulfilling life.',
    lastUpdated: '2024-03-10',
    url: 'https://www.edx.org/learn/science-of-wellbeing'
  }
]; 