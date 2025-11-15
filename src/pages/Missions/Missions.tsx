import { useEffect, useState } from 'react';
import LifeStories from '@/shared/components/layout/Stories/LifeStories';
import WeeklyMissions from '@/shared/components/layout/StoriesBar/WeeklyMissions';
import { useLifeCategories, type LifeCategory } from '@/shared/hooks/useLifeCategories';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './Missions.module.css';

const Missions = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const lifeCategories = useLifeCategories();
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory | null>(null);

  useEffect(() => {
    if (lifeCategories.length === 0) {
      return;
    }

    setSelectedCategory(prev => {
      if (prev) {
        const updated = lifeCategories.find(category => category.id === prev.id);
        if (updated) {
          return updated;
        }
      }
      return lifeCategories[0];
    });
  }, [lifeCategories]);

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.heroKicker}>{t('floating.quickInspiration')}</span>
          <h1 className={styles.title}>{t('missions.title')}</h1>
          <p className={styles.subtitle}>{t('missions.subtitle')}</p>
        </div>
      </div>

      <div className={styles.categoriesSection}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>{t('missions.categoriesLabel')}</span>
          <p className={styles.panelDescription}>{t('missions.categoriesDescription')}</p>
        </div>
        <div className={styles.storiesWrapper}>
          <LifeStories
            categories={lifeCategories}
            onCategorySelect={category => setSelectedCategory(category)}
          />
        </div>
      </div>

      <div className={styles.missionsPanel}>
        <div className={styles.missionsContent}>
          {selectedCategory ? (
            <WeeklyMissions category={selectedCategory} />
          ) : (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>{t('missions.emptyTitle')}</h2>
              <p className={styles.emptySubtitle}>{t('missions.emptySubtitle')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Missions;
