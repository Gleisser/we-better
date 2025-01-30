import { GoalCategory } from './types';

export const CATEGORY_CONFIG = {
  learning: {
    icon: '📚',
    label: 'Learning',
    colorRGB: '139, 92, 246'
  },
  fitness: {
    icon: '💪',
    label: 'Fitness',
    colorRGB: '236, 72, 153'
  },
  career: {
    icon: '💼',
    label: 'Career',
    colorRGB: '16, 185, 129'
  },
  personal: {
    icon: '🎯',
    label: 'Personal',
    colorRGB: '245, 158, 11'
  }
} as const; 