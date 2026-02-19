import { useEffect, useMemo, useState } from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import MissionCategories, {
  type MissionCategory,
} from './components/MissionCategories/MissionCategories';
import CategoryMissions from './components/CategoryMissions/CategoryMissions';
import { missionCategoryImageMap } from './constants/categoryImageMap';
import styles from './MissionsPage.module.css';

const MissionsPage = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<MissionCategory['id'] | null>(null);

  const categories = useMemo<MissionCategory[]>(
    () => [
      {
        id: 'social',
        name: t('missions.categories.social') as string,
        image: missionCategoryImageMap.social,
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
        name: t('missions.categories.health') as string,
        image: missionCategoryImageMap.health,
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
        name: t('missions.categories.selfCare') as string,
        image: missionCategoryImageMap.selfCare,
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
        name: t('missions.categories.money') as string,
        image: missionCategoryImageMap.money,
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
        name: t('missions.categories.family') as string,
        image: missionCategoryImageMap.family,
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
        name: t('missions.categories.spirituality') as string,
        image: missionCategoryImageMap.spirituality,
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
        name: t('missions.categories.relationship') as string,
        image: missionCategoryImageMap.relationship,
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
        name: t('missions.categories.career') as string,
        image: missionCategoryImageMap.career,
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
  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

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
          <CategoryMissions category={selectedCategory} />
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{t('missions.empty.title')}</p>
            <p className={styles.emptyDescription}>{t('missions.empty.description')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MissionsPage;
