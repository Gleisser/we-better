import { LifeCategory } from '../types';

export const DEFAULT_LIFE_CATEGORIES: LifeCategory[] = [
  {
    id: 'career',
    name: 'Career',
    description: 'Professional growth, achievements, and satisfaction',
    icon: '💼',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    value: 5,
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Physical and mental wellbeing, fitness, and nutrition',
    icon: '💪',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    value: 5,
  },
  {
    id: 'finances',
    name: 'Finances',
    description: 'Financial stability, income, savings, and investments',
    icon: '💰',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    value: 5,
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Personal connections, family, friends, and romantic relationships',
    icon: '❤️',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    value: 5,
  },
  {
    id: 'personal_growth',
    name: 'Personal Growth',
    description: 'Learning, skills development, and self-improvement',
    icon: '🌱',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    value: 5,
  },
  {
    id: 'recreation',
    name: 'Recreation',
    description: 'Leisure activities, hobbies, entertainment, and fun',
    icon: '🎮',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    value: 5,
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    description: 'Sense of purpose, meaning, mindfulness, and connection',
    icon: '✨',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    value: 5,
  },
  {
    id: 'community',
    name: 'Community',
    description: 'Social involvement, contribution, and belonging',
    icon: '🌍',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    value: 5,
  }
];

export const MAX_CATEGORY_VALUE = 10;
export const MIN_CATEGORY_VALUE = 1; 