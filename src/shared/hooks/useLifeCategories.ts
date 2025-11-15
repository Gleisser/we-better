import { useMemo } from 'react';
import { useCommonTranslation } from './useTranslation';

export interface LifeCategory {
  id: string;
  name: string;
  color: {
    from: string;
    to: string;
  };
  icon: string;
  score: number;
  hasUpdate: boolean;
}

/**
 * Provides a memoized list of life categories with their display metadata.
 */
export const useLifeCategories = (): LifeCategory[] => {
  const { t } = useCommonTranslation();

  return useMemo(
    () => [
      {
        id: 'social',
        name: t('floating.lifeCategories.social') as string,
        color: {
          from: '#8B5CF6',
          to: '#D946EF',
        },
        icon: '👥',
        score: 85,
        hasUpdate: true,
      },
      {
        id: 'health',
        name: t('floating.lifeCategories.health') as string,
        color: {
          from: '#10B981',
          to: '#34D399',
        },
        icon: '💪',
        score: 70,
        hasUpdate: true,
      },
      {
        id: 'selfCare',
        name: t('floating.lifeCategories.selfCare') as string,
        color: {
          from: '#F59E0B',
          to: '#FBBF24',
        },
        icon: '🧘‍♂️',
        score: 65,
        hasUpdate: false,
      },
      {
        id: 'money',
        name: t('floating.lifeCategories.money') as string,
        color: {
          from: '#3B82F6',
          to: '#60A5FA',
        },
        icon: '💰',
        score: 75,
        hasUpdate: true,
      },
      {
        id: 'family',
        name: t('floating.lifeCategories.family') as string,
        color: {
          from: '#EC4899',
          to: '#F472B6',
        },
        icon: '👨‍👩‍👧‍👦',
        score: 90,
        hasUpdate: true,
      },
      {
        id: 'spirituality',
        name: t('floating.lifeCategories.spirituality') as string,
        color: {
          from: '#8B5CF6',
          to: '#A78BFA',
        },
        icon: '🧘‍♀️',
        score: 60,
        hasUpdate: false,
      },
      {
        id: 'relationship',
        name: t('floating.lifeCategories.relationship') as string,
        color: {
          from: '#EF4444',
          to: '#F87171',
        },
        icon: '❤️',
        score: 80,
        hasUpdate: true,
      },
      {
        id: 'career',
        name: t('floating.lifeCategories.career') as string,
        color: {
          from: '#6366F1',
          to: '#818CF8',
        },
        icon: '💼',
        score: 85,
        hasUpdate: true,
      },
    ],
    [t]
  );
};
