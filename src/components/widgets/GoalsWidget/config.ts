import { GoalCategory } from './types';

export const CATEGORY_CONFIG: Record<GoalCategory, { icon: string; label: string }> = {
  learning: {
    icon: '📚',
    label: 'Learning'
  },
  fitness: {
    icon: '💪',
    label: 'Fitness'
  },
  career: {
    icon: '💼',
    label: 'Career'
  },
  personal: {
    icon: '🎯',
    label: 'Personal'
  },
  financial: {
    icon: '💰',
    label: 'Financial'
  }
}; 