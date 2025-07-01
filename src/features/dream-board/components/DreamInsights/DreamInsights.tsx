import React, { useState, useEffect, useMemo } from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';

interface Insight {
  id: string;
  type: 'pattern' | 'balance' | 'progress' | 'suggestion';
  title: string;
  description: string;
  relatedCategories?: string[];
}

interface Resource {
  id: string;
  title: string;
  type: string;
  relevantDreamIds: string[];
}

interface DreamInsightsProps {
  dreams: Dream[];
  insights: Insight[];
  resources: Resource[];
}

const InsightTypeIcons: Record<string, string> = {
  pattern: '🔍',
  balance: '⚖️',
  progress: '📈',
  suggestion: '💡',
};

const DreamInsights: React.FC<DreamInsightsProps> = ({ dreams, insights }) => {
  const { t } = useCommonTranslation();

  // Helper function to get translated category name
  const getTranslatedCategoryName = (categoryName: string): string => {
    // Convert category name to lowercase for key matching
    const normalizedName = categoryName.toLowerCase();

    // Try to get translation, fallback to original name if not found
    const translationKey = `dreamBoard.categories.names.${normalizedName}`;
    const translated = t(translationKey);

    // Handle array return type from translation function
    const translatedString = Array.isArray(translated) ? translated[0] : translated;

    // If translation key is returned as-is, it means no translation was found
    return translatedString !== translationKey ? translatedString : categoryName;
  };

  // Helper function to get translated insight title
  const getTranslatedInsightTitle = (title: string): string => {
    // Convert title to lowercase and replace spaces with underscores for key matching
    const normalizedTitle = title.toLowerCase().replace(/\s+/g, '_');

    // Try to get translation, fallback to original title if not found
    const translationKey = `dreamBoard.insights.titles.${normalizedTitle}`;
    const translated = t(translationKey);

    // Handle array return type from translation function
    const translatedString = Array.isArray(translated) ? translated[0] : translated;

    // If translation key is returned as-is, it means no translation was found
    return translatedString !== translationKey ? translatedString : title;
  };

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
      filters: {
        all: t('dreamBoard.insights.filters.all') as string,
        patterns: t('dreamBoard.insights.filters.patterns') as string,
        balance: t('dreamBoard.insights.filters.balance') as string,
        progress: t('dreamBoard.insights.filters.progress') as string,
      },
      keyTakeaways: {
        title: t('dreamBoard.insights.keyTakeaways.title') as string,
        emptyMessage: t('dreamBoard.insights.keyTakeaways.emptyMessage') as string,
      },
      relatedDreams: {
        title: t('dreamBoard.insights.relatedDreams.title') as string,
        noRelated: t('dreamBoard.insights.relatedDreams.noRelated') as string,
      },
      modal: {
        title: t('dreamBoard.insights.modal.title') as string,
        dataVisualization: t('dreamBoard.insights.modal.dataVisualization') as string,
        visualizationPlaceholder: t('dreamBoard.insights.modal.visualizationPlaceholder') as string,
      },
    }),
    [t]
  );

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [focusedInsight, setFocusedInsight] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; insightId: string | null }>({
    isOpen: false,
    insightId: null,
  });

  // Filter insights based on the active filter
  const filteredInsights = activeFilter
    ? insights.filter(insight => insight.type === activeFilter)
    : insights;

  // Find a key insight for the takeaways section
  const keyInsight = insights.find(
    insight => insight.type === 'pattern' || insight.type === 'progress'
  );

  // Generate some related dreams for each insight based on categories
  const getRelatedDreams = (insight: Insight): Dream[] => {
    if (!insight.relatedCategories || insight.relatedCategories.length === 0) {
      return [];
    }

    return dreams.filter(dream => insight.relatedCategories?.includes(dream.category)).slice(0, 3); // Limit to 3 related dreams
  };

  // Generate a random visual type for some insights
  useEffect(() => {
    const visualInsights = new Set<string>();
    insights.forEach(insight => {
      // Add visuals to random insights (about 1/3 of them)
      if (Math.random() > 0.66) {
        visualInsights.add(insight.id);
      }
    });
  }, [insights]);

  // Toggle focus on an insight card
  const toggleFocus = (insightId: string): void => {
    setFocusedInsight(prev => (prev === insightId ? null : insightId));
  };

  // Close detail modal
  const closeDetailModal = (): void => {
    setDetailModal({ isOpen: false, insightId: null });
  };

  // Get insight class name based on its type
  const getInsightClassName = (insight: Insight): string => {
    const baseClass = styles.insightCard;
    const typeClass = styles[`${insight.type}Insight`];
    const focusedClass = focusedInsight === insight.id ? styles.insightCardFocused : '';
    const animationClass = styles.slideInAnimation;
    return `${baseClass} ${typeClass} ${focusedClass} ${animationClass}`;
  };

  return (
    <div className={styles.insightsTab}>
      {/* Header with filters */}
      <div className={styles.insightsHeader}>
        <div className={styles.insightsFilters}>
          <button
            className={`${styles.filterButton} ${activeFilter === null ? styles.active : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            {translations.filters.all}
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'pattern' ? styles.active : ''}`}
            onClick={() => setActiveFilter('pattern')}
          >
            {translations.filters.patterns}
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'balance' ? styles.active : ''}`}
            onClick={() => setActiveFilter('balance')}
          >
            {translations.filters.balance}
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'progress' ? styles.active : ''}`}
            onClick={() => setActiveFilter('progress')}
          >
            {translations.filters.progress}
          </button>
        </div>
      </div>

      {/* Key Takeaways section */}
      <div className={styles.keyTakeaways}>
        <div className={styles.keyTakeawaysHeader}>
          <span role="img" aria-label="key">
            🔑
          </span>
          <h3>{translations.keyTakeaways.title}</h3>
        </div>
        <div className={styles.keyTakeawaysContent}>
          {keyInsight ? keyInsight.description : translations.keyTakeaways.emptyMessage}
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className={styles.insightsGrid}>
        {filteredInsights.map(insight => (
          <div
            key={insight.id}
            className={getInsightClassName(insight)}
            onClick={() => toggleFocus(insight.id)}
          >
            <div className={styles.insightIconContainer}>
              <span role="img" aria-label={insight.type}>
                {InsightTypeIcons[insight.type]}
              </span>
            </div>
            <h3>{getTranslatedInsightTitle(insight.title)}</h3>
            <p>{insight.description}</p>

            {/* Related categories */}
            {insight.relatedCategories && insight.relatedCategories.length > 0 && (
              <div className={styles.relatedCategories}>
                {insight.relatedCategories.map(category => (
                  <span key={category} className={styles.relatedCategoryTag}>
                    {getTranslatedCategoryName(category)}
                  </span>
                ))}
              </div>
            )}

            {/* Related dreams section (visible on focused cards) */}
            {focusedInsight === insight.id && (
              <div className={styles.relatedDreamsSection}>
                <div className={styles.relatedDreamsTitle}>{translations.relatedDreams.title}</div>
                <div className={styles.relatedDreamsList}>
                  {getRelatedDreams(insight).map(dream => (
                    <span key={dream.id} className={styles.relatedDreamTag}>
                      {dream.title}
                    </span>
                  ))}
                  {getRelatedDreams(insight).length === 0 && (
                    <span className={styles.relatedDreamTag}>
                      {translations.relatedDreams.noRelated}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal (Focus Mode) */}
      {detailModal.isOpen && detailModal.insightId && (
        <div className={styles.modalOverlay} onClick={closeDetailModal}>
          <div className={styles.insightDetailModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {insights.find(i => i.id === detailModal.insightId)?.title ||
                  translations.modal.title}
              </h2>
              <button className={styles.modalCloseButton} onClick={closeDetailModal}>
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              {/* Expanded insight details would go here */}
              <p>{insights.find(i => i.id === detailModal.insightId)?.description}</p>

              <div className={styles.dataVisSection}>
                <h3>{translations.modal.dataVisualization}</h3>
                <div className={styles.timelineContainer}>
                  {/* In a real app, this would contain actual visualizations */}
                  <p style={{ textAlign: 'center', paddingTop: '80px' }}>
                    {translations.modal.visualizationPlaceholder}
                  </p>
                </div>
              </div>

              <div className={styles.relatedDreamsSection}>
                <h3>{translations.relatedDreams.title}</h3>
                <div className={styles.relatedDreamsList}>
                  {getRelatedDreams(
                    insights.find(i => i.id === detailModal.insightId) || insights[0]
                  ).map(dream => (
                    <div key={dream.id} className={styles.relatedDreamTag}>
                      {dream.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamInsights;
