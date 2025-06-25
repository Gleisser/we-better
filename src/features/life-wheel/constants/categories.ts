import { LifeCategory } from '../types';

// Translation function type
type TranslationFunction = (key: string) => string;

export const getLocalizedCategories = (t?: TranslationFunction): LifeCategory[] => [
  {
    id: 'career',
    name: t ? t('widgets.lifeWheel.categories.career') : 'Career',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.career')
      : 'Professional growth, achievements, and satisfaction',
    icon: '💼',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    value: 5,
  },
  {
    id: 'health',
    name: t ? t('widgets.lifeWheel.categories.health') : 'Health',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.health')
      : 'Physical and mental wellbeing, fitness, and nutrition',
    icon: '💪',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    value: 5,
  },
  {
    id: 'finances',
    name: t ? t('widgets.lifeWheel.categories.finances') : 'Finances',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.finances')
      : 'Financial stability, income, savings, and investments',
    icon: '💰',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    value: 5,
  },
  {
    id: 'relationships',
    name: t ? t('widgets.lifeWheel.categories.relationships') : 'Relationships',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.relationships')
      : 'Personal connections, family, friends, and romantic relationships',
    icon: '❤️',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    value: 5,
  },
  {
    id: 'personal_growth',
    name: t ? t('widgets.lifeWheel.categories.personalGrowth') : 'Personal Growth',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.personalGrowth')
      : 'Learning, skills development, and self-improvement',
    icon: '🌱',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    value: 5,
  },
  {
    id: 'recreation',
    name: t ? t('widgets.lifeWheel.categories.recreation') : 'Recreation',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.recreation')
      : 'Leisure activities, hobbies, entertainment, and fun',
    icon: '🎮',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    value: 5,
  },
  {
    id: 'spiritual',
    name: t ? t('widgets.lifeWheel.categories.spiritual') : 'Spiritual',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.spiritual')
      : 'Sense of purpose, meaning, mindfulness, and connection',
    icon: '✨',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    value: 5,
  },
  {
    id: 'community',
    name: t ? t('widgets.lifeWheel.categories.community') : 'Community',
    description: t
      ? t('widgets.lifeWheel.categoryDescriptions.community')
      : 'Social involvement, contribution, and belonging',
    icon: '🌍',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    value: 5,
  },
];

// Keep the original export for backward compatibility
export const DEFAULT_LIFE_CATEGORIES: LifeCategory[] = getLocalizedCategories();

export const MAX_CATEGORY_VALUE = 10;
export const MIN_CATEGORY_VALUE = 1;
