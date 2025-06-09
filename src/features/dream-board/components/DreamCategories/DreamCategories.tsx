import React, { useRef, useEffect, useState } from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';
import { useDreamProgress } from '../../hooks/useDreamProgress';

// CategoryDetails type for styling and presentation
type CategoryDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

interface DreamCategoriesProps {
  categories: string[];
  dreams: Dream[];
  getCategoryDetails: (category: string) => CategoryDetails;
  calculateCategoryProgress: (category: string) => number;
  hoveredCategory: string | null;
  setHoveredCategory: (category: string | null) => void;
  expandedCategory: string | null;
  toggleCategoryExpand: (category: string) => void;
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
}

const DreamCategories: React.FC<DreamCategoriesProps> = ({
  categories,
  dreams,
  getCategoryDetails,
  calculateCategoryProgress: _calculateCategoryProgress,
  hoveredCategory,
  setHoveredCategory,
  expandedCategory,
  toggleCategoryExpand,
  filterCategory,
  setFilterCategory,
}) => {
  // Animation refs for categories
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Backend integration for progress tracking
  const { getProgressForDream, loading: _loading, error } = useDreamProgress();
  const [dreamProgresses, setDreamProgresses] = useState<Record<string, number>>({});

  // Initialize progress values from backend when component mounts
  useEffect(() => {
    const loadProgressValues = async (): Promise<void> => {
      const progressMap: Record<string, number> = {};

      for (const dream of dreams) {
        try {
          // Get latest progress from backend
          const latestProgress = await getProgressForDream(dream.id);
          if (latestProgress !== undefined) {
            progressMap[dream.id] = latestProgress;
          } else {
            // Use the current progress from the dream object as fallback
            progressMap[dream.id] = dream.progress;
          }
        } catch (error) {
          console.error(`Error loading progress for dream ${dream.id}:`, error);
          progressMap[dream.id] = dream.progress;
        }
      }

      setDreamProgresses(progressMap);
    };

    if (dreams.length > 0) {
      loadProgressValues();
    }
  }, [dreams, getProgressForDream]);

  // Calculate category progress using backend progress data
  const calculateBackendCategoryProgress = (category: string): number => {
    const categoryDreams = dreams.filter(
      dream => dream.category.toLowerCase() === category.toLowerCase()
    );
    if (categoryDreams.length === 0) return 0;

    const totalProgress = categoryDreams.reduce((sum, dream) => {
      // Use backend progress if available, fallback to dream.progress
      const progress = dreamProgresses[dream.id] ?? dream.progress;
      return sum + progress;
    }, 0);

    return totalProgress / categoryDreams.length;
  };

  return (
    <section className={styles.categoriesDashboard}>
      <div className={styles.categoriesHeader}>
        <h2>Dream Categories</h2>
        <div className={styles.categoriesControls}>
          {filterCategory && (
            <button className={styles.clearFilterButton} onClick={() => setFilterCategory(null)}>
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Show error state */}
      {error && (
        <div className={styles.errorState}>
          <span>Error loading progress: {error}</span>
        </div>
      )}

      <div className={styles.categoriesGrid}>
        {categories.map(category => {
          const categoryDetail = getCategoryDetails(category);
          const isHovered = hoveredCategory === category;
          const isExpanded = expandedCategory === category;
          // Use backend-synced progress calculation
          const categoryProgress = calculateBackendCategoryProgress(category);
          const dreamCount = dreams.filter(
            dream => dream.category.toLowerCase() === category.toLowerCase()
          ).length;
          const hasDreams = dreamCount > 0;
          const isActive = hasDreams;

          return (
            <div
              key={category}
              ref={el => (categoryRefs.current[category] = el)}
              className={`${styles.categoryCard} ${isExpanded ? styles.expanded : ''} ${isActive ? styles.active : styles.dormant}`}
              style={{
                background: isHovered ? categoryDetail.hoverGradient : categoryDetail.gradient,
                boxShadow: `0 8px 24px ${categoryDetail.shadowColor}`,
              }}
              onClick={() => toggleCategoryExpand(category)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onFocus={() => setHoveredCategory(category)}
              onBlur={() => setHoveredCategory(null)}
              tabIndex={0}
              role="button"
              aria-expanded={isExpanded}
            >
              <div className={styles.categoryHeader}>
                <div className={styles.categoryIconContainer}>
                  <div
                    className={styles.categoryIcon}
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url(${categoryDetail.illustration})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className={styles.categoryIconOverlay}></div>
                  </div>
                </div>

                <div className={styles.categoryContent}>
                  <h3>{category}</h3>
                  <div
                    className={styles.dreamCount}
                    aria-label={`${dreamCount} dreams in ${category}`}
                  >
                    {dreamCount} {dreamCount === 1 ? 'dream' : 'dreams'}
                  </div>

                  {/* Progress visualization */}
                  <div className={styles.categoryProgressWrapper}>
                    <div className={styles.categoryProgressBar}>
                      <div
                        className={styles.categoryProgressFill}
                        style={{
                          width: `${categoryProgress * 100}%`,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        }}
                      ></div>
                    </div>
                    <span className={styles.categoryProgressLabel}>
                      {Math.round(categoryProgress * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded content (visible only when expanded) */}
              {isExpanded && (
                <div className={styles.expandedCategoryContent}>
                  {hasDreams ? (
                    <div className={styles.categoryQuickDreams}>
                      <h4>Dreams</h4>
                      <ul className={styles.quickDreamsList}>
                        {dreams
                          .filter(dream => dream.category.toLowerCase() === category.toLowerCase())
                          .slice(0, 3)
                          .map(dream => {
                            // Use backend progress if available, fallback to dream.progress
                            const currentProgress = dreamProgresses[dream.id] ?? dream.progress;
                            return (
                              <li key={dream.id} className={styles.quickDreamItem}>
                                <span className={styles.quickDreamTitle}>{dream.title}</span>
                                <span className={styles.quickDreamProgress}>
                                  {Math.round(currentProgress * 100)}%
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                      {/* Show if there are more dreams */}
                      {dreams.filter(
                        dream => dream.category.toLowerCase() === category.toLowerCase()
                      ).length > 3 && (
                        <div className={styles.moreDreamsIndicator}>
                          +
                          {dreams.filter(
                            dream => dream.category.toLowerCase() === category.toLowerCase()
                          ).length - 3}{' '}
                          more dreams
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.emptyStateMessage}>
                      <p>No dreams in this category yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DreamCategories;
