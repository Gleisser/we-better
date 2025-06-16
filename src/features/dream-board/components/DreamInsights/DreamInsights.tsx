import React, { useState, useEffect } from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';
import { useInsights, type ComponentInsight } from '../../hooks/useInsights';

interface Resource {
  id: string;
  title: string;
  type: string;
  relevantDreamIds: string[];
}

interface DreamInsightsProps {
  dreams: Dream[];
  resources?: Resource[];
}

const InsightTypeIcons: Record<string, string> = {
  pattern: '🔍',
  balance: '⚖️',
  progress: '📈',
  suggestion: '💡',
};

const DreamInsights: React.FC<DreamInsightsProps> = ({ dreams }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [focusedInsight, setFocusedInsight] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; insightId: string | null }>({
    isOpen: false,
    insightId: null,
  });

  // Use the insights hook to get real data from the API
  const { insights, loading, error, refreshInsights, generateFresh, clearError } = useInsights();

  // Filter insights based on the active filter
  const filteredInsights = activeFilter
    ? insights.filter(insight => insight.type === activeFilter)
    : insights;

  // Find a key insight for the takeaways section
  const keyInsight = insights.find(
    insight => insight.type === 'pattern' || insight.type === 'progress'
  );

  // Generate some related dreams for each insight based on categories
  const getRelatedDreams = (insight: ComponentInsight): Dream[] => {
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
  const getInsightClassName = (insight: ComponentInsight): string => {
    const baseClass = styles.insightCard;
    const typeClass = styles[`${insight.type}Insight`];
    const focusedClass = focusedInsight === insight.id ? styles.insightCardFocused : '';
    const animationClass = styles.slideInAnimation;
    return `${baseClass} ${typeClass} ${focusedClass} ${animationClass}`;
  };

  // Handle filter changes (now makes API calls)
  const handleFilterChange = async (filterType: string | null): Promise<void> => {
    setActiveFilter(filterType);

    // If a specific filter is selected, make an API call with that type
    if (filterType) {
      await refreshInsights({
        types: [filterType as 'pattern' | 'balance' | 'progress' | 'suggestion'],
      });
    } else {
      // If "All" is selected, refresh without type filter
      await refreshInsights();
    }
  };

  // Handle refresh button click
  const handleRefresh = async (): Promise<void> => {
    await generateFresh();
  };

  return (
    <div className={styles.insightsTab}>
      {/* Header with filters and refresh button */}
      <div className={styles.insightsHeader}>
        <div className={styles.insightsFilters}>
          <button
            className={`${styles.filterButton} ${activeFilter === null ? styles.active : ''}`}
            onClick={() => handleFilterChange(null)}
            disabled={loading}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'pattern' ? styles.active : ''}`}
            onClick={() => handleFilterChange('pattern')}
            disabled={loading}
          >
            Patterns
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'balance' ? styles.active : ''}`}
            onClick={() => handleFilterChange('balance')}
            disabled={loading}
          >
            Balance
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'progress' ? styles.active : ''}`}
            onClick={() => handleFilterChange('progress')}
            disabled={loading}
          >
            Progress
          </button>
        </div>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loading}
          title="Generate fresh insights"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <button className={styles.errorDismiss} onClick={clearError}>
            ×
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && insights.length === 0 && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>⏳</div>
          <p>Generating your personalized insights...</p>
        </div>
      )}

      {/* Key Takeaways section */}
      <div className={styles.keyTakeaways}>
        <div className={styles.keyTakeawaysHeader}>
          <span role="img" aria-label="key">
            🔑
          </span>
          <h3>Key Takeaways</h3>
        </div>
        <div className={styles.keyTakeawaysContent}>
          {keyInsight
            ? keyInsight.description
            : 'Start adding more dreams to get personalized insights!'}
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
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>

            {/* Related categories */}
            {insight.relatedCategories && insight.relatedCategories.length > 0 && (
              <div className={styles.relatedCategories}>
                {insight.relatedCategories.map(category => (
                  <span key={category} className={styles.relatedCategoryTag}>
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Related dreams section (visible on focused cards) */}
            {focusedInsight === insight.id && (
              <div className={styles.relatedDreamsSection}>
                <div className={styles.relatedDreamsTitle}>Related Dreams</div>
                <div className={styles.relatedDreamsList}>
                  {getRelatedDreams(insight).map(dream => (
                    <span key={dream.id} className={styles.relatedDreamTag}>
                      {dream.title}
                    </span>
                  ))}
                  {getRelatedDreams(insight).length === 0 && (
                    <span className={styles.relatedDreamTag}>No related dreams yet</span>
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
                {insights.find(i => i.id === detailModal.insightId)?.title || 'Insight Details'}
              </h2>
              <button className={styles.modalCloseButton} onClick={closeDetailModal}>
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              {/* Expanded insight details would go here */}
              <p>{insights.find(i => i.id === detailModal.insightId)?.description}</p>

              <div className={styles.dataVisSection}>
                <h3>Data Visualization</h3>
                <div className={styles.timelineContainer}>
                  {/* In a real app, this would contain actual visualizations */}
                  <p style={{ textAlign: 'center', paddingTop: '80px' }}>
                    Interactive visualization would appear here
                  </p>
                </div>
              </div>

              <div className={styles.relatedDreamsSection}>
                <h3>Related Dreams</h3>
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
