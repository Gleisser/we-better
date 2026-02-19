import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import MissionCategories, {
  type MissionCategory,
} from './components/MissionCategories/MissionCategories';
import CategoryMissions, {
  type CategoryMissionData,
} from './components/CategoryMissions/CategoryMissions';
import { type MissionCategoryId, missionCategoryImageMap } from './constants/categoryImageMap';
import {
  fetchMissions,
  normalizeMissionLocale,
  updateMissionProgress,
  type MissionsApiResponse,
} from '@/core/services/missionsService';
import styles from './MissionsPage.module.css';

const categoryVisuals: Record<
  MissionCategoryId,
  {
    color: MissionCategory['color'];
    icon: string;
  }
> = {
  social: {
    color: { from: '#8B5CF6', to: '#D946EF' },
    icon: '👥',
  },
  health: {
    color: { from: '#10B981', to: '#34D399' },
    icon: '💪',
  },
  selfCare: {
    color: { from: '#F59E0B', to: '#FBBF24' },
    icon: '🧘‍♂️',
  },
  money: {
    color: { from: '#3B82F6', to: '#60A5FA' },
    icon: '💰',
  },
  family: {
    color: { from: '#EC4899', to: '#F472B6' },
    icon: '👨‍👩‍👧‍👦',
  },
  spirituality: {
    color: { from: '#8B5CF6', to: '#A78BFA' },
    icon: '🧘‍♀️',
  },
  relationship: {
    color: { from: '#EF4444', to: '#F87171' },
    icon: '❤️',
  },
  career: {
    color: { from: '#6366F1', to: '#818CF8' },
    icon: '💼',
  },
};

const categoryOrder: MissionCategoryId[] = [
  'social',
  'health',
  'selfCare',
  'money',
  'family',
  'spirituality',
  'relationship',
  'career',
];

const MissionsPage = (): JSX.Element => {
  const { t, currentLanguage } = useCommonTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<MissionCategory['id'] | null>(null);
  const [missionsData, setMissionsData] = useState<MissionsApiResponse | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const categories = useMemo<MissionCategory[]>(() => {
    const summaryByCategory = new Map(
      (missionsData?.categories ?? []).map(item => [item.id, item])
    );

    return categoryOrder.map(categoryId => {
      const summary = summaryByCategory.get(categoryId);
      return {
        id: categoryId,
        name: t(`missions.categories.${categoryId}`) as string,
        image: missionCategoryImageMap[categoryId],
        color: categoryVisuals[categoryId].color,
        icon: categoryVisuals[categoryId].icon,
        score: summary?.completionPercent ?? 0,
        hasUpdate: summary?.hasUpdate ?? false,
      };
    });
  }, [missionsData?.categories, t]);

  const loadMissions = useCallback(async (): Promise<void> => {
    try {
      const locale = normalizeMissionLocale(currentLanguage);
      const payload = await fetchMissions(locale);
      setMissionsData(payload);
      setLoadError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load missions');
      setLoadError(err);
      console.error('Failed to load missions:', err);
    }
  }, [currentLanguage]);

  const handleMissionStatusChange = useCallback(
    async (
      categoryId: MissionCategoryId,
      missionId: string,
      status: 'active' | 'completed'
    ): Promise<void> => {
      try {
        await updateMissionProgress({
          categoryId,
          missionKey: missionId,
          status,
        });
        await loadMissions();
      } catch (error) {
        console.error('Failed to update mission status:', error);
        await loadMissions();
      }
    },
    [loadMissions]
  );

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );
  const selectedCategoryMissions = useMemo<CategoryMissionData[]>(() => {
    if (!selectedCategory) return [];

    const source = missionsData?.missionsByCategory?.[selectedCategory.id] ?? [];
    return source.map(mission => ({
      id: mission.key,
      title: mission.title,
      description: mission.description,
      effort: mission.effort,
      estimatedMinutes: mission.estimatedMinutes,
      difficulty: mission.difficulty,
      badge: mission.badge,
      stretchGoal: mission.stretchGoal,
      tip: mission.tip,
      status: mission.status,
      completedAt: mission.completedAt,
    }));
  }, [missionsData?.missionsByCategory, selectedCategory]);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('missions.title')}</h2>
        <p className={styles.subtitle}>{t('missions.subtitle')}</p>
      </header>

      <section className={styles.categoriesSection}>
        <MissionCategories
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
      </section>

      <section className={styles.contentSection}>
        {selectedCategory ? (
          <CategoryMissions
            category={selectedCategory}
            missions={selectedCategoryMissions}
            onMissionStatusChange={(missionId, status) =>
              handleMissionStatusChange(selectedCategory.id, missionId, status)
            }
          />
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {loadError ? (t('errors.general') as string) : (t('missions.empty.title') as string)}
            </p>
            <p className={styles.emptyDescription}>
              {loadError ? loadError.message : (t('missions.empty.description') as string)}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MissionsPage;
