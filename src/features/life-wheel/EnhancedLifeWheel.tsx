import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './components/RadarChart/EnhancedRadarChart';
import { LifeCategory } from './types';
import { DEFAULT_LIFE_CATEGORIES } from './constants/categories';
import styles from './LifeWheel.module.css';
import { getLatestLifeWheelData, saveLifeWheelData, getLifeWheelHistory } from './api/lifeWheelApi';
import ReactDOM from 'react-dom';

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
    targetElement: HTMLElement | null;
    content: string;
    title: string;
  }>({
    visible: false,
    targetElement: null,
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

  // Show tooltip on hover with more reliable positioning
  const handleShowTooltip = useCallback(
    (event: React.MouseEvent, title: string, content: string) => {
      // Store the reference to the target element
      const targetElement = event.currentTarget as HTMLElement;

      setTooltipInfo({
        visible: true,
        targetElement,
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

              {historyEntries.length < 2 ? (
                <div className={styles.emptyState}>
                  <p>You need at least two dates to compare and get insights.</p>
                  <p>
                    Complete and save more life wheel assessments over time to track your progress.
                  </p>
                </div>
              ) : (
                <>
                  {/* Elegant Date Selector */}
                  <div className={styles.insightDateSelector}>
                    <div className={styles.datePickerContainer}>
                      <div className={styles.dateSelectorCard}>
                        <div className={styles.dateSelectorHeader}>
                          <span className={styles.dateSelectorLabel}>Select Dates to Compare</span>
                        </div>
                        <div className={styles.dateSelectors}>
                          <div className={styles.dateColumn}>
                            <div className={styles.dateColumnLabel}>
                              <div
                                className={styles.dateColorIndicator}
                                style={{ background: '#8B5CF6' }}
                              ></div>
                              <span>Base Date</span>
                            </div>
                            <select
                              id="baseDate"
                              value={selectedHistoryEntry || ''}
                              onChange={e => setSelectedHistoryEntry(e.target.value)}
                              className={`${styles.dateDropdown} ${styles.baseDateDropdown}`}
                            >
                              <option value="" disabled>
                                Select a date
                              </option>
                              {historyEntries.map(entry => (
                                <option key={`base-${entry.id}`} value={entry.id}>
                                  {formatDate(entry.date)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className={styles.dateCompareArrow}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12H19M19 12L13 6M19 12L13 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <div className={styles.dateColumn}>
                            <div className={styles.dateColumnLabel}>
                              <div
                                className={styles.dateColorIndicator}
                                style={{ background: '#EC4899' }}
                              ></div>
                              <span>Compare With</span>
                            </div>
                            <select
                              id="compareDate"
                              value={comparisonEntry || ''}
                              onChange={e => setComparisonEntry(e.target.value)}
                              className={`${styles.dateDropdown} ${styles.compareDateDropdown}`}
                            >
                              <option value="" disabled>
                                Select a date
                              </option>
                              {historyEntries
                                .filter(entry => entry.id !== selectedHistoryEntry)
                                .map(entry => (
                                  <option key={`compare-${entry.id}`} value={entry.id}>
                                    {formatDate(entry.date)}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {selectedHistoryEntry && comparisonEntry && (
                          <div className={styles.comparingDates}>
                            <span>
                              Comparing{' '}
                              <span className={styles.baseDate}>
                                {formatDate(
                                  historyEntries.find(e => e.id === selectedHistoryEntry)?.date ||
                                    ''
                                )}
                              </span>{' '}
                              with{' '}
                              <span className={styles.compareDate}>
                                {formatDate(
                                  historyEntries.find(e => e.id === comparisonEntry)?.date || ''
                                )}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!selectedHistoryEntry || !comparisonEntry ? (
                    <div className={styles.promptState}>
                      <p>Select two dates above to compare and see insights.</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.insightsDashboard}>
                        <div className={styles.insightsSummaryCards}>
                          {getHighlightedAreas().improved && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className={`${styles.insightCard} ${styles.improvedCard}`}
                            >
                              <div className={styles.insightCardIcon}>
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M7 14L12 9L17 14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
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
                            </motion.div>
                          )}

                          {getHighlightedAreas().declined && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className={`${styles.insightCard} ${styles.declinedCard}`}
                            >
                              <div className={styles.insightCardIcon}>
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M7 10L12 15L17 10"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
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
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={`${styles.insightCard} ${styles.summaryCard}`}
                          >
                            <div className={styles.insightCardIcon}>
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 6V20M16 6V20M12 10V16M6 12H8M16 12H18M12 4V6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <h4>Summary</h4>
                            <div className={styles.insightsSummaryStats}>
                              <div className={styles.statItem}>
                                <span className={styles.statLabel}>Improved Areas</span>
                                <span className={styles.statValue}>
                                  {calculateInsights().filter(i => i.change > 0).length}
                                </span>
                              </div>
                              <div className={styles.statItem}>
                                <span className={styles.statLabel}>Declined Areas</span>
                                <span className={styles.statValue}>
                                  {calculateInsights().filter(i => i.change < 0).length}
                                </span>
                              </div>
                              <div className={styles.statItem}>
                                <span className={styles.statLabel}>Unchanged</span>
                                <span className={styles.statValue}>
                                  {calculateInsights().filter(i => i.change === 0).length}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className={styles.insightsDetailsContainer}>
                          <h3 className={styles.insightsDetailHeader}>
                            <span>Changes by Category</span>
                            <div className={styles.insightsSorter}>
                              <span className={styles.sorterLabel}>Sort by:</span>
                              <button className={styles.sorterButton}>
                                Largest Change
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M17 8L12 3L7 8M17 16L12 21L7 16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </h3>

                          <div className={styles.insightsDetailsList}>
                            {calculateInsights()?.length > 0 &&
                              calculateInsights()
                                .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                                .map((insight, index) => (
                                  <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 * index }}
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
                                    <div className={styles.insightItemContent}>
                                      <span className={styles.insightItemCategory}>
                                        {insight.category}
                                      </span>
                                      <div className={styles.insightItemValues}>
                                        <div className={styles.valueWithLabel}>
                                          <span className={styles.valueLabel}>From</span>
                                          <span className={styles.insightItemPrevious}>
                                            {insight.previousValue}
                                          </span>
                                        </div>
                                        <span className={styles.insightItemArrow}>→</span>
                                        <div className={styles.valueWithLabel}>
                                          <span className={styles.valueLabel}>To</span>
                                          <span className={styles.insightItemCurrent}>
                                            {insight.currentValue}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className={styles.insightItemChangeContainer}>
                                      <div
                                        className={`${styles.changeValue} ${insight.change > 0 ? styles.positive : insight.change < 0 ? styles.negative : styles.neutral}`}
                                      >
                                        {insight.change > 0 ? '+' : ''}
                                        {insight.change}
                                      </div>
                                      <div className={styles.changeBar}>
                                        <div
                                          className={`${styles.changeBarInner} ${insight.change > 0 ? styles.positiveBar : insight.change < 0 ? styles.negativeBar : styles.neutralBar}`}
                                          style={{
                                            width: `${Math.min(Math.abs(insight.change) * 10, 100)}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipInfo.visible && tooltipInfo.targetElement && (
          <TooltipPortal>
            <motion.div
              className={styles.tooltip}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'fixed',
                ...getTooltipPosition(tooltipInfo.targetElement),
                zIndex: 1000,
              }}
            >
              <h4 className={styles.tooltipTitle}>{tooltipInfo.title}</h4>
              <p className={styles.tooltipContent}>{tooltipInfo.content}</p>
            </motion.div>
          </TooltipPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

// TooltipPortal component for rendering the tooltip in the document body
const TooltipPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

// Helper function to calculate tooltip position
const getTooltipPosition = (
  targetElement: HTMLElement
): { left: string; top: string; transform: string } => {
  const rect = targetElement.getBoundingClientRect();

  // Calculate centered position well above the element
  // Increased the vertical offset to create more space for interaction
  return {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - 50}px`, // Increased from 10px to 50px to position tooltip higher
    transform: 'translate(-50%, -100%)',
  };
};

export default EnhancedLifeWheel;
