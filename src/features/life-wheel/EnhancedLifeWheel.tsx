import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './components/RadarChart/EnhancedRadarChart';
import { LifeCategory } from './types';
import { DEFAULT_LIFE_CATEGORIES } from './constants/categories';
import styles from './LifeWheel.module.css';
import { getLatestLifeWheelData, saveLifeWheelData, getLifeWheelHistory } from './api/lifeWheelApi';

type HistoryEntry = {
  id: string;
  date: string;
  categories: LifeCategory[];
};

interface EnhancedLifeWheelProps {
  readOnly?: boolean;
  className?: string;
}

const EnhancedLifeWheel = ({
  readOnly = false,
  className = '',
}: EnhancedLifeWheelProps): JSX.Element => {
  // Current wheel data
  const [categories, setCategories] = useState<LifeCategory[]>(DEFAULT_LIFE_CATEGORIES);

  // States for loading, error, saving
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History tracking
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<string | null>(null);
  const [comparisonEntry, setComparisonEntry] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'insights'>('current');
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    title: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
    title: '',
  });

  // Load current life wheel data
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await getLatestLifeWheelData();
        if (response.entry) {
          setCategories(response.entry.categories);
        }
      } catch (err) {
        console.error('Error loading life wheel data:', err);
        setError(new Error('Failed to load your life wheel data. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load history data
  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      try {
        setHistoryLoading(true);
        const response = await getLifeWheelHistory();
        if (response.entries && response.entries.length > 0) {
          setHistoryEntries(
            response.entries.map(entry => ({
              id: entry.id,
              date: entry.date,
              categories: entry.categories,
            }))
          );

          // Set the latest entry as selected by default
          setSelectedHistoryEntry(response.entries[0].id);
        }
      } catch (err) {
        console.error('Error loading life wheel history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Handle category value change
  const handleValueChange = useCallback(
    (categoryId: string, newValue: number) => {
      if (readOnly) return;

      setCategories(prev =>
        prev.map(cat => (cat.id === categoryId ? { ...cat, value: newValue } : cat))
      );
    },
    [readOnly]
  );

  // Save the current wheel data
  const handleSave = useCallback(async () => {
    if (readOnly) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setError(null);

      await saveLifeWheelData({ categories });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Reload history after saving
      const response = await getLifeWheelHistory();
      if (response.entries && response.entries.length > 0) {
        setHistoryEntries(
          response.entries.map(entry => ({
            id: entry.id,
            date: entry.date,
            categories: entry.categories,
          }))
        );
      }
    } catch (err) {
      console.error('Error saving life wheel data:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save your life wheel data. Please try again.';
      setError(new Error(errorMessage));
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [categories, readOnly]);

  // Switch between selected history entries
  const handleHistoryEntrySelect = useCallback((entryId: string) => {
    setSelectedHistoryEntry(entryId);
  }, []);

  // Add/remove comparison entry
  const handleToggleComparison = useCallback(
    (entryId: string) => {
      if (comparisonEntry === entryId) {
        setComparisonEntry(null);
        setShowComparison(false);
      } else {
        setComparisonEntry(entryId);
        setShowComparison(true);
      }
    },
    [comparisonEntry]
  );

  // Show tooltip on hover
  const handleShowTooltip = useCallback(
    (event: React.MouseEvent, title: string, content: string) => {
      setTooltipInfo({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        title,
        content,
      });
    },
    []
  );

  // Hide tooltip
  const handleHideTooltip = useCallback(() => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  }, []);

  // Get the current view data based on active tab and selections
  const getCurrentViewData = useCallback(() => {
    if (activeTab === 'current') {
      return categories;
    } else if (activeTab === 'history' && selectedHistoryEntry) {
      const entry = historyEntries.find(e => e.id === selectedHistoryEntry);
      return entry ? entry.categories : categories;
    }
    return categories;
  }, [activeTab, categories, historyEntries, selectedHistoryEntry]);

  // Get comparison data if comparison mode is enabled
  const getComparisonData = useCallback(() => {
    if (showComparison && comparisonEntry) {
      const entry = historyEntries.find(e => e.id === comparisonEntry);
      return entry ? entry.categories : null;
    }
    return null;
  }, [showComparison, comparisonEntry, historyEntries]);

  // Calculate insights between two points in time
  const calculateInsights = useCallback(() => {
    if (!selectedHistoryEntry || !comparisonEntry) return [];

    const currentEntry = historyEntries.find(e => e.id === selectedHistoryEntry);
    const compareEntry = historyEntries.find(e => e.id === comparisonEntry);

    if (!currentEntry || !compareEntry) return [];

    const insights = currentEntry.categories
      .map(currentCat => {
        const compareCat = compareEntry.categories.find(c => c.id === currentCat.id);
        if (!compareCat) return null;

        const change = currentCat.value - compareCat.value;
        return {
          category: currentCat.name,
          change,
          currentValue: currentCat.value,
          previousValue: compareCat.value,
          color: currentCat.color,
          id: currentCat.id,
        };
      })
      .filter(Boolean) as Array<{
      category: string;
      change: number;
      currentValue: number;
      previousValue: number;
      color: string | { from: string; to: string };
      id: string;
    }>;

    return insights;
  }, [selectedHistoryEntry, comparisonEntry, historyEntries]);

  // Determine the most improved and most declined categories
  const getHighlightedAreas = useCallback(() => {
    const insights = calculateInsights();
    if (!insights || insights.length === 0) return { improved: null, declined: null };

    const sortedByChange = [...insights].sort((a, b) => b.change - a.change);

    return {
      improved:
        sortedByChange.length > 0 && sortedByChange[0].change > 0 ? sortedByChange[0] : null,
      declined:
        sortedByChange.length > 0 && sortedByChange[sortedByChange.length - 1].change < 0
          ? sortedByChange[sortedByChange.length - 1]
          : null,
    };
  }, [calculateInsights]);

  // Format a date string
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={`${styles.lifeWheelContainer} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your life wheel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.lifeWheelContainer} ${className}`}>
        <div className={styles.errorState}>
          <h3>Something went wrong</h3>
          <p>{error.message || 'Failed to load life wheel data'}</p>
          <button onClick={() => setError(null)} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.lifeWheelContainer} ${className}`}>
      {/* Main content container - no background image needed since the parent has it */}
      <div className={styles.glassCard}>
        {/* Navigation tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'current' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current Assessment
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History & Progress
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'insights' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>

        {/* Current Assessment Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'current' && (
            <motion.div
              key="current-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              <h1 className={styles.title}>Life Wheel Assessment</h1>

              <div
                style={{
                  width: '100%',
                  height: '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  margin: '20px 0',
                }}
              >
                <RadarChart
                  data={categories.map(category => ({
                    name: category.name,
                    value: category.value,
                    color: category.color,
                    id: category.id,
                    description: category.description || '',
                    icon: category.icon || '',
                  }))}
                  animate={true}
                  onCategoryClick={category =>
                    handleShowTooltip(
                      {
                        clientX: window.innerWidth / 2,
                        clientY: window.innerHeight / 2,
                      } as React.MouseEvent,
                      category.name,
                      category.description || `Your current score is ${category.value}/10`
                    )
                  }
                  className={styles.enhancedRadarChart}
                />
              </div>

              <div className={styles.categoriesList}>
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={styles.categoryItem}
                    onMouseEnter={e =>
                      handleShowTooltip(e, category.name, category.description || '')
                    }
                    onMouseLeave={handleHideTooltip}
                  >
                    <div className={styles.categoryHeader}>
                      <div
                        className={styles.categoryColor}
                        style={{
                          background:
                            typeof category.color === 'string'
                              ? category.color
                              : `linear-gradient(to right, ${(category.color as { from: string; to: string }).from}, ${(category.color as { from: string; to: string }).to})`,
                        }}
                      />
                      <h3 className={styles.categoryName}>{category.name}</h3>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={category.value}
                      onChange={e => handleValueChange(category.id, parseInt(e.target.value))}
                      className={styles.slider}
                      style={
                        {
                          '--track-color':
                            typeof category.color === 'string'
                              ? category.color
                              : (category.color as { from: string; to: string }).from,
                        } as React.CSSProperties
                      }
                      disabled={readOnly}
                    />
                    <div className={styles.valueLabel}>{category.value}/10</div>
                  </div>
                ))}
              </div>

              {!readOnly && (
                <div className={styles.actionButtons}>
                  <button
                    onClick={handleSave}
                    className={styles.completeButton}
                    disabled={isSaving}
                    type="button"
                  >
                    {isSaving ? 'Saving...' : 'Save Assessment'}
                  </button>
                </div>
              )}

              {saveSuccess && (
                <div className={styles.successMessage}>
                  Your Life Wheel data has been saved successfully!
                </div>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              <h1 className={styles.title}>Progress Over Time</h1>

              {historyLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading history...</p>
                </div>
              ) : historyEntries.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>
                    No history entries yet. Save your first assessment to start tracking progress!
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.timelineContainer}>
                    {historyEntries.map(entry => (
                      <button
                        key={entry.id}
                        className={`${styles.timelineEntry} ${selectedHistoryEntry === entry.id ? styles.selectedEntry : ''}`}
                        onClick={() => handleHistoryEntrySelect(entry.id)}
                      >
                        <span className={styles.timelineDate}>{formatDate(entry.date)}</span>
                        <div className={styles.compareCheckbox}>
                          <input
                            type="checkbox"
                            checked={comparisonEntry === entry.id}
                            onChange={() => handleToggleComparison(entry.id)}
                            onClick={e => e.stopPropagation()}
                          />
                          <span>Compare</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className={styles.historyViewContainer}>
                    <div
                      style={{
                        width: '100%',
                        height: '500px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        margin: '20px 0',
                      }}
                    >
                      <RadarChart
                        data={getCurrentViewData().map(category => ({
                          name: category.name,
                          value: category.value,
                          color: category.color,
                          id: category.id,
                          description: category.description || '',
                          icon: category.icon || '',
                        }))}
                        comparisonData={getComparisonData()?.map(category => ({
                          name: category.name,
                          value: category.value,
                          color: category.color,
                          id: category.id,
                          description: category.description || '',
                          icon: category.icon || '',
                        }))}
                        animate={true}
                        showComparison={showComparison}
                        className={styles.enhancedRadarChart}
                      />
                    </div>

                    {selectedHistoryEntry && (
                      <div className={styles.historyDetails}>
                        <h3>
                          {formatDate(
                            historyEntries.find(e => e.id === selectedHistoryEntry)?.date || ''
                          )}
                        </h3>
                        {comparisonEntry && (
                          <div className={styles.comparisonInfo}>
                            <p>
                              Comparing with:{' '}
                              {formatDate(
                                historyEntries.find(e => e.id === comparisonEntry)?.date || ''
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              <h1 className={styles.title}>Life Wheel Insights</h1>

              {!comparisonEntry || !selectedHistoryEntry ? (
                <div className={styles.emptyState}>
                  <p>Select two dates from the History tab to compare and get insights.</p>
                  <button className={styles.insightsButton} onClick={() => setActiveTab('history')}>
                    Go to History
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.insightsHeader}>
                    <h3>
                      Comparing{' '}
                      {formatDate(
                        historyEntries.find(e => e.id === selectedHistoryEntry)?.date || ''
                      )}{' '}
                      with{' '}
                      {formatDate(historyEntries.find(e => e.id === comparisonEntry)?.date || '')}
                    </h3>
                  </div>

                  <div className={styles.insightsSummary}>
                    {getHighlightedAreas().improved && (
                      <div className={styles.insightCard}>
                        <h4>Most Improved</h4>
                        <div className={styles.insightHighlight}>
                          <span className={styles.insightCategory}>
                            {getHighlightedAreas().improved?.category}
                          </span>
                          <span className={`${styles.insightChange} ${styles.positive}`}>
                            +{getHighlightedAreas().improved?.change}
                          </span>
                        </div>
                        <p>
                          From {getHighlightedAreas().improved?.previousValue} to{' '}
                          {getHighlightedAreas().improved?.currentValue}
                        </p>
                      </div>
                    )}

                    {getHighlightedAreas().declined && (
                      <div className={styles.insightCard}>
                        <h4>Most Declined</h4>
                        <div className={styles.insightHighlight}>
                          <span className={styles.insightCategory}>
                            {getHighlightedAreas().declined?.category}
                          </span>
                          <span className={`${styles.insightChange} ${styles.negative}`}>
                            {getHighlightedAreas().declined?.change}
                          </span>
                        </div>
                        <p>
                          From {getHighlightedAreas().declined?.previousValue} to{' '}
                          {getHighlightedAreas().declined?.currentValue}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.insightsDetailsList}>
                    <h3>Changes by Category</h3>
                    {calculateInsights()?.length > 0 &&
                      calculateInsights().map(insight => (
                        <div
                          key={insight.id}
                          className={styles.insightItem}
                          style={{
                            borderLeft: `4px solid ${
                              typeof insight.color === 'string'
                                ? insight.color
                                : insight.color.from || '#8B5CF6'
                            }`,
                          }}
                        >
                          <span className={styles.insightItemCategory}>{insight.category}</span>
                          <div className={styles.insightItemValues}>
                            <span className={styles.insightItemPrevious}>
                              {insight.previousValue}
                            </span>
                            <span className={styles.insightItemArrow}>→</span>
                            <span className={styles.insightItemCurrent}>
                              {insight.currentValue}
                            </span>
                            <span
                              className={`${styles.insightItemChange} ${insight.change > 0 ? styles.positive : insight.change < 0 ? styles.negative : ''}`}
                            >
                              {insight.change > 0 ? '+' : ''}
                              {insight.change}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipInfo.visible && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              left: tooltipInfo.x + 15,
              top: tooltipInfo.y - 15,
              zIndex: 1000,
            }}
          >
            <h4 className={styles.tooltipTitle}>{tooltipInfo.title}</h4>
            <p className={styles.tooltipContent}>{tooltipInfo.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedLifeWheel;
