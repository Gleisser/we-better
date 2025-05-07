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

  // Add these new state variables after the existing state declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds per frame
  const [timelineIndex, setTimelineIndex] = useState(0);

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

  // Helper function to determine the background color based on score
  const getCategoryBackgroundColor = (value: number): string => {
    if (value < 5) {
      return 'rgba(239, 68, 68, 0.2)'; // Red background for low values
    } else if (value >= 5 && value <= 7) {
      return 'rgba(245, 158, 11, 0.2)'; // Orange/yellow for medium values
    } else {
      return 'rgba(16, 185, 129, 0.2)'; // Green for high values
    }
  };

  // Helper function to get category health indicator text
  const getCategoryHealthText = (value: number): { text: string; color: string } => {
    if (value < 5) {
      return { text: 'Needs Attention', color: '#ef4444' };
    } else if (value >= 5 && value <= 7) {
      return { text: 'Developing', color: '#f59e0b' };
    } else {
      return { text: 'Thriving', color: '#10b981' };
    }
  };

  // Add a function to handle the animation playback
  const handlePlayTimeline = useCallback(() => {
    if (historyEntries.length <= 1) {
      return; // Can't animate with only one entry
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    // Start at the current selected history entry or at the beginning
    const startIndex = selectedHistoryEntry
      ? historyEntries.findIndex(e => e.id === selectedHistoryEntry)
      : 0;

    setTimelineIndex(startIndex >= 0 ? startIndex : 0);
  }, [historyEntries, isPlaying, selectedHistoryEntry]);

  // Effect to handle the animation progression
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      // Move to next timeline entry
      setTimelineIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= historyEntries.length) {
          setIsPlaying(false); // Stop at the end
          return prev;
        }

        // Update the selected entry to match the timeline
        setSelectedHistoryEntry(historyEntries[nextIndex].id);
        return nextIndex;
      });
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, timelineIndex, historyEntries, playbackSpeed]);

  // Add a function to handle playback speed changes
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  // Add a function to handle scrubber movement
  const handleScrubberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newIndex = parseInt(e.target.value);
      setTimelineIndex(newIndex);
      if (historyEntries[newIndex]) {
        setSelectedHistoryEntry(historyEntries[newIndex].id);
      }
    },
    [historyEntries]
  );

  // Add a function to calculate changes between dates
  const getChangeSummary = useCallback(() => {
    if (!selectedHistoryEntry || historyEntries.length <= 1) return null;

    // Find the previous entry index
    const currentIndex = historyEntries.findIndex(e => e.id === selectedHistoryEntry);
    if (currentIndex <= 0) return null; // No previous entry

    const previousEntry = historyEntries[currentIndex - 1];
    const currentEntry = historyEntries[currentIndex];

    // Calculate changes
    const changes = currentEntry.categories
      .map(currentCat => {
        const previousCat = previousEntry.categories.find(c => c.id === currentCat.id);
        if (!previousCat) return null;

        const change = currentCat.value - previousCat.value;
        return {
          category: currentCat.name,
          change,
          previousValue: previousCat.value,
          currentValue: currentCat.value,
          color: currentCat.color,
          id: currentCat.id,
        };
      })
      .filter(Boolean) as Array<{
      category: string;
      change: number;
      previousValue: number;
      currentValue: number;
      color: string | { from: string; to: string };
      id: string;
    }>;

    // Sort by change magnitude (absolute value)
    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [selectedHistoryEntry, historyEntries]);

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
                  data={categories.map(category => {
                    const healthColor = getCategoryHealthText(category.value).color;
                    return {
                      name: category.name,
                      value: category.value,
                      color: healthColor,
                      id: category.id,
                      description: category.description || '',
                      icon: category.icon || '',
                      healthStatus: getCategoryHealthText(category.value).text,
                    };
                  })}
                  animate={true}
                  onCategoryClick={category =>
                    handleShowTooltip(
                      {
                        clientX: window.innerWidth / 2,
                        clientY: window.innerHeight / 2,
                      } as React.MouseEvent,
                      category.name,
                      `${category.description || `Score: ${category.value}/10`} (${category.healthStatus})`
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
                    style={{
                      background: getCategoryBackgroundColor(category.value),
                      transition: 'background-color 0.3s ease',
                    }}
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
                    <div className={styles.valueContainer}>
                      <div className={styles.valueLabel}>{category.value}/10</div>
                      <div
                        className={styles.healthIndicator}
                        style={{
                          color: getCategoryHealthText(category.value).color,
                          backgroundColor: `${getCategoryHealthText(category.value).color}20`,
                        }}
                      >
                        {getCategoryHealthText(category.value).text}
                      </div>
                    </div>
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

                  {/* Timeline Animation Controls */}
                  <div className={styles.timelineControls}>
                    <button
                      className={`${styles.timelineButton} ${isPlaying ? styles.pauseButton : styles.playButton}`}
                      onClick={handlePlayTimeline}
                      disabled={historyEntries.length <= 1}
                      title={isPlaying ? 'Pause Animation' : 'Play Timeline Animation'}
                    >
                      {isPlaying ? '❚❚' : '▶'}
                    </button>

                    <div className={styles.speedControls}>
                      <span>Speed:</span>
                      <button
                        onClick={() => handleSpeedChange(2000)}
                        className={`${styles.speedButton} ${playbackSpeed === 2000 ? styles.activeSpeed : ''}`}
                        title="Slow"
                      >
                        0.5x
                      </button>
                      <button
                        onClick={() => handleSpeedChange(1000)}
                        className={`${styles.speedButton} ${playbackSpeed === 1000 ? styles.activeSpeed : ''}`}
                        title="Normal"
                      >
                        1x
                      </button>
                      <button
                        onClick={() => handleSpeedChange(500)}
                        className={`${styles.speedButton} ${playbackSpeed === 500 ? styles.activeSpeed : ''}`}
                        title="Fast"
                      >
                        2x
                      </button>
                    </div>

                    <div className={styles.timelineProgress}>
                      <div className={styles.progressIndicator}>
                        <span>
                          {timelineIndex + 1} / {historyEntries.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Scrubber */}
                  {historyEntries.length > 1 && (
                    <div className={styles.scrubberContainer}>
                      <div className={styles.dateLabel}>
                        {formatDate(historyEntries[0]?.date || '')}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={historyEntries.length - 1}
                        value={timelineIndex}
                        onChange={handleScrubberChange}
                        className={styles.scrubber}
                      />
                      <div className={styles.dateLabel}>
                        {formatDate(historyEntries[historyEntries.length - 1]?.date || '')}
                      </div>
                    </div>
                  )}

                  <div className={styles.historyViewContainer}>
                    {/* Current date display */}
                    <div className={styles.currentDateDisplay}>
                      <motion.div
                        key={selectedHistoryEntry}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.dateCard}
                      >
                        <h3 className={styles.currentDateHeading}>
                          {formatDate(
                            historyEntries.find(e => e.id === selectedHistoryEntry)?.date || ''
                          )}
                        </h3>
                        {isPlaying && (
                          <div className={styles.animatingIndicator}>
                            <div className={styles.pulse}></div>
                            <span>Animating</span>
                          </div>
                        )}
                      </motion.div>
                    </div>

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
                        data={getCurrentViewData().map(category => {
                          const healthColor = getCategoryHealthText(category.value).color;
                          return {
                            name: category.name,
                            value: category.value,
                            color: healthColor,
                            id: category.id,
                            description: category.description || '',
                            icon: category.icon || '',
                            healthStatus: getCategoryHealthText(category.value).text,
                          };
                        })}
                        comparisonData={getComparisonData()?.map(category => {
                          const healthColor = getCategoryHealthText(category.value).color;
                          return {
                            name: category.name,
                            value: category.value,
                            color: healthColor,
                            id: category.id,
                            description: category.description || '',
                            icon: category.icon || '',
                            healthStatus: getCategoryHealthText(category.value).text,
                          };
                        })}
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

                    {isPlaying && (
                      <div className={styles.changeSummary}>
                        <h3 className={styles.changeSummaryTitle}>Changes from Previous Period</h3>
                        <div className={styles.changesList}>
                          {getChangeSummary()
                            ?.slice(0, 3)
                            .map(change => (
                              <div
                                key={change.id}
                                className={styles.changeItem}
                                style={{
                                  borderLeft: `3px solid ${
                                    typeof change.color === 'string'
                                      ? change.color
                                      : (change.color as { from: string; to: string }).from
                                  }`,
                                }}
                              >
                                <div className={styles.changeHeader}>
                                  <span className={styles.changeName}>{change.category}</span>
                                  <span
                                    className={`${styles.changeValue} ${change.change > 0 ? styles.positive : change.change < 0 ? styles.negative : ''}`}
                                  >
                                    {change.change > 0 ? '+' : ''}
                                    {change.change}
                                  </span>
                                </div>
                                <div className={styles.changeDetail}>
                                  {change.previousValue} → {change.currentValue}
                                </div>
                              </div>
                            ))}
                        </div>
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
