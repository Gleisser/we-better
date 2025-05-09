import React, { useState, useRef } from 'react';
import styles from './DreamBoardPage.module.css';
import { Dream, JournalEntry, Milestone } from './types';
import {
  mockDreams,
  mockCategories,
  mockJournalEntries,
  mockResources,
  mockChallenges,
  mockInsights,
  mockWeather,
  mockNotifications,
} from './mock-data';
import { CosmicDreamExperience } from './components/CosmicDreamExperience/CosmicDreamExperience';
import { DreamBoardModal } from './components/DreamBoardModal';
import { DEFAULT_LIFE_CATEGORIES } from '../life-wheel/constants/categories';
import categoryDetails from './components/constants/dreamboard';
import achievementBadges from './components/constants/achievements';
import QuickVision from './components/QuickVision';

type CategoryDetails = {
  icon: string;
  illustration: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  color: string;
};

// Utility function to get category details
const getCategoryDetails = (category: string): CategoryDetails => {
  return (
    categoryDetails[category as keyof typeof categoryDetails] || {
      icon: '🌟',
      illustration: '/assets/images/dreamboard/spirituality.webp', // Default placeholder image
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      hoverGradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.4)',
      color: '#8B5CF6',
    }
  );
};

const DreamBoardPage: React.FC = () => {
  const [expandedMiniBoard, setExpandedMiniBoard] = useState(false);
  const [activeTab, setActiveTab] = useState('vision-board');
  const [dreams, setDreams] = useState<Dream[]>(mockDreams);
  const [journalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [activeDream, setActiveDream] = useState<Dream | null>(null);
  const [isDreamBoardModalOpen, setIsDreamBoardModalOpen] = useState(false);

  // New state variables for Dream Categories section
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // New state variables for milestone management
  const [selectedDreamForMilestones, setSelectedDreamForMilestones] = useState<string | null>(null);
  const [milestoneAction, setMilestoneAction] = useState<'add' | 'edit' | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [milestoneHistory, setMilestoneHistory] = useState<
    Array<{ dreamId: string; milestoneId: string; action: string; timestamp: string }>
  >([]);
  const [showMilestonesPopup, setShowMilestonesPopup] = useState(false);

  // New state for inline form display
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // New state variables for visualizations
  const [activeVizTab, setActiveVizTab] = useState<'timeline' | 'chart' | 'achievements' | null>(
    null
  );

  // Define achievement badge criteria

  // Toggle mini vision board expansion
  const toggleMiniBoard = (): void => {
    setExpandedMiniBoard(!expandedMiniBoard);
  };

  // Helper to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Handle dream selection
  const handleDreamSelect = (dream: Dream | null): void => {
    setActiveDream(dream);
  };

  // Update dream progress
  const updateDreamProgress = (dreamId: string, adjustment: number): void => {
    setDreams(prevDreams =>
      prevDreams.map(dream => {
        if (dream.id === dreamId) {
          // Calculate new progress and ensure it stays between 0 and 1
          const newProgress = Math.min(1, Math.max(0, dream.progress + adjustment));
          return { ...dream, progress: newProgress };
        }
        return dream;
      })
    );
  };

  // Calculate the overall progress for a category
  const calculateCategoryProgress = (category: string): number => {
    const categoryDreams = dreams.filter(dream => dream.category === category);
    if (categoryDreams.length === 0) return 0;

    const totalProgress = categoryDreams.reduce((sum, dream) => sum + dream.progress, 0);
    return totalProgress / categoryDreams.length;
  };

  // Handle category card expansion
  const toggleCategoryExpand = (category: string): void => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  // Animation refs for categories
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Milestone Management Functions
  const handleMilestoneComplete = (
    dreamId: string,
    milestoneId: string,
    isComplete: boolean
  ): void => {
    setDreams(prevDreams =>
      prevDreams.map(dream => {
        if (dream.id === dreamId) {
          const updatedMilestones = dream.milestones.map(milestone =>
            milestone.id === milestoneId ? { ...milestone, completed: isComplete } : milestone
          );

          // Add to history
          setMilestoneHistory(prev => [
            ...prev,
            {
              dreamId,
              milestoneId,
              action: isComplete ? 'completed' : 'uncompleted',
              timestamp: new Date().toISOString(),
            },
          ]);

          // Recalculate progress based on milestones
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          const totalCount = updatedMilestones.length;
          const newProgress = totalCount > 0 ? completedCount / totalCount : 0;

          return {
            ...dream,
            milestones: updatedMilestones,
            progress: newProgress,
          };
        }
        return dream;
      })
    );
  };

  const handleDeleteMilestone = (dreamId: string, milestoneId: string): void => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      setDreams(prevDreams =>
        prevDreams.map(dream => {
          if (dream.id === dreamId) {
            const updatedMilestones = dream.milestones.filter(
              milestone => milestone.id !== milestoneId
            );

            // Add to history
            setMilestoneHistory(prev => [
              ...prev,
              {
                dreamId,
                milestoneId,
                action: 'deleted',
                timestamp: new Date().toISOString(),
              },
            ]);

            // Recalculate progress
            const completedCount = updatedMilestones.filter(m => m.completed).length;
            const totalCount = updatedMilestones.length;
            const newProgress = totalCount > 0 ? completedCount / totalCount : 0;

            return {
              ...dream,
              milestones: updatedMilestones,
              progress: newProgress,
            };
          }
          return dream;
        })
      );
    }
  };

  // Handle opening the milestone management popup
  const handleOpenMilestoneManager = (dreamId: string): void => {
    setSelectedDreamForMilestones(dreamId);
    setShowMilestonesPopup(true);
    // Reset milestone form view whenever popup opens
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Handle initiating add/edit milestone
  const handleInitiateMilestoneAction = (
    action: 'add' | 'edit',
    milestone: Milestone | null = null
  ): void => {
    setMilestoneAction(action);
    setCurrentMilestone(milestone);
    setShowMilestoneForm(true);
  };

  // Handle save milestone with integrated form
  const handleSaveMilestone = (e: React.FormEvent): void => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;

    if (!selectedDreamForMilestones) return;

    const milestoneData: Milestone = {
      id: currentMilestone?.id || '',
      title,
      description,
      completed: currentMilestone?.completed || false,
      date: date ? new Date(date).toISOString() : undefined,
    };

    setDreams(prevDreams =>
      prevDreams.map(dream => {
        if (dream.id === selectedDreamForMilestones) {
          let updatedMilestones;

          if (milestoneAction === 'add') {
            // Generate a unique ID for new milestone
            const newMilestone = {
              ...milestoneData,
              id: `m${Date.now()}`,
              completed: false,
            };
            updatedMilestones = [...dream.milestones, newMilestone];

            // Add to history
            setMilestoneHistory(prev => [
              ...prev,
              {
                dreamId: dream.id,
                milestoneId: newMilestone.id,
                action: 'added',
                timestamp: new Date().toISOString(),
              },
            ]);
          } else if (milestoneAction === 'edit' && currentMilestone) {
            updatedMilestones = dream.milestones.map(m =>
              m.id === currentMilestone.id ? milestoneData : m
            );

            // Add to history
            setMilestoneHistory(prev => [
              ...prev,
              {
                dreamId: dream.id,
                milestoneId: milestoneData.id,
                action: 'edited',
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            updatedMilestones = dream.milestones;
          }

          // Recalculate progress
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          const totalCount = updatedMilestones.length;
          const newProgress = totalCount > 0 ? completedCount / totalCount : 0;

          return {
            ...dream,
            milestones: updatedMilestones,
            progress: newProgress,
          };
        }
        return dream;
      })
    );

    // Reset form state
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Cancel milestone editing/adding
  const handleCancelMilestoneForm = (): void => {
    setShowMilestoneForm(false);
    setMilestoneAction(null);
    setCurrentMilestone(null);
  };

  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get selected dream object
  const selectedDream = dreams.find(dream => dream.id === selectedDreamForMilestones);

  // Generate path for the progress chart
  const generateProgressChartPath = (
    dataPoints: Array<{ date: Date; percentage: number }>,
    width: number,
    height: number
  ): string => {
    if (dataPoints.length === 0) return '';

    // Find min and max dates for scaling
    const minDate = dataPoints[0].date;
    const maxDate = dataPoints[dataPoints.length - 1].date;
    const timeRange = maxDate.getTime() - minDate.getTime();

    // Create SVG path
    return dataPoints
      .map((point, index) => {
        const x = width * ((point.date.getTime() - minDate.getTime()) / timeRange);
        const y = height - (point.percentage / 100) * height;
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
  };

  // Get completion events from history to create progress chart data
  const getProgressChartData = (dreamId: string): Array<{ date: Date; percentage: number }> => {
    const relevantEvents = milestoneHistory
      .filter(
        h => h.dreamId === dreamId && (h.action === 'completed' || h.action === 'uncompleted')
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (relevantEvents.length === 0) {
      const dream = dreams.find(d => d.id === dreamId);
      if (!dream) return [];

      // If no events but we have current progress, add a single data point
      return [
        {
          date: new Date(),
          percentage: dream.progress * 100,
        },
      ];
    }

    // Calculate progress at each event
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return [];

    const totalMilestones = dream.milestones.length;
    const points: Array<{ date: Date; percentage: number }> = [];
    let currentCompleted = 0;

    // Add starting point if we have events
    points.push({
      date: new Date(relevantEvents[0].timestamp),
      percentage: 0,
    });

    relevantEvents.forEach(event => {
      if (event.action === 'completed') {
        currentCompleted++;
      } else if (event.action === 'uncompleted') {
        currentCompleted = Math.max(0, currentCompleted - 1);
      }

      const percentage = totalMilestones > 0 ? (currentCompleted / totalMilestones) * 100 : 0;
      points.push({
        date: new Date(event.timestamp),
        percentage,
      });
    });

    return points;
  };

  return (
    <div className={styles.dreamBoardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dream Board</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'vision-board' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('vision-board')}
          >
            Vision Board
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'experience' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'insights' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'journal' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            Journal
          </button>
        </div>
      </header>

      {/* Quick Access Mini Vision Board - only show in vision-board tab */}
      {activeTab === 'vision-board' && (
        <QuickVision
          dreams={dreams}
          expandedMiniBoard={expandedMiniBoard}
          toggleMiniBoard={toggleMiniBoard}
          updateDreamProgress={updateDreamProgress}
          openDreamBoardModal={() => setIsDreamBoardModalOpen(true)}
        />
      )}

      {/* Main Content Section */}
      <main className={styles.mainContent}>
        {activeTab === 'vision-board' && (
          <div className={styles.visionBoardTab}>
            {/* Dream Categories Dashboard - ENHANCED VERSION */}
            <section className={styles.categoriesDashboard}>
              <div className={styles.categoriesHeader}>
                <h2>Dream Categories</h2>
                <div className={styles.categoriesControls}>
                  {filterCategory && (
                    <button
                      className={styles.clearFilterButton}
                      onClick={() => setFilterCategory(null)}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.categoriesGrid}>
                {mockCategories.map(category => {
                  const categoryDetail = getCategoryDetails(category);
                  const isHovered = hoveredCategory === category;
                  const isExpanded = expandedCategory === category;
                  const categoryProgress = calculateCategoryProgress(category);
                  const dreamCount = dreams.filter(dream => dream.category === category).length;
                  const hasDreams = dreamCount > 0;
                  const isActive = hasDreams;

                  return (
                    <div
                      key={category}
                      ref={el => (categoryRefs.current[category] = el)}
                      className={`${styles.categoryCard} ${isExpanded ? styles.expanded : ''} ${isActive ? styles.active : styles.dormant}`}
                      style={{
                        background: isHovered
                          ? categoryDetail.hoverGradient
                          : categoryDetail.gradient,
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
                                  .filter(dream => dream.category === category)
                                  .slice(0, 3)
                                  .map(dream => (
                                    <li key={dream.id} className={styles.quickDreamItem}>
                                      <span className={styles.quickDreamTitle}>{dream.title}</span>
                                      <span className={styles.quickDreamProgress}>
                                        {Math.round(dream.progress * 100)}%
                                      </span>
                                    </li>
                                  ))}
                              </ul>
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

            {/* Progress Tracking Layer - Modified for cleaner UI */}
            <section className={styles.progressSection}>
              <h2>Dream Progress</h2>
              <div className={styles.dreamsProgress}>
                {dreams.map(dream => (
                  <div key={dream.id} className={styles.dreamProgressCard}>
                    <h3>{dream.title}</h3>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${dream.progress * 100}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{Math.round(dream.progress * 100)}%</span>
                    <div className={styles.milestonesInfo}>
                      {dream.milestones.filter(m => m.completed).length} of{' '}
                      {dream.milestones.length} milestones completed
                    </div>

                    {/* Milestone Management Button */}
                    <button
                      className={styles.manageMilestonesButton}
                      onClick={() => handleOpenMilestoneManager(dream.id)}
                    >
                      Manage Milestones
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline Visualization */}
            <section className={styles.timelineSection}>
              <h2>Dream Timeline</h2>
              <div className={styles.timelineContainer}>
                <div className={styles.timeframeColumn}>
                  <h3>Short-term</h3>
                  {dreams
                    .filter(dream => dream.timeframe === 'short-term')
                    .map(dream => (
                      <div key={dream.id} className={styles.timelineDream}>
                        <div className={styles.dreamTitle}>{dream.title}</div>
                        <div className={styles.categoryBadge}>{dream.category}</div>
                      </div>
                    ))}
                </div>
                <div className={styles.timeframeColumn}>
                  <h3>Mid-term</h3>
                  {dreams
                    .filter(dream => dream.timeframe === 'mid-term')
                    .map(dream => (
                      <div key={dream.id} className={styles.timelineDream}>
                        <div className={styles.dreamTitle}>{dream.title}</div>
                        <div className={styles.categoryBadge}>{dream.category}</div>
                      </div>
                    ))}
                </div>
                <div className={styles.timeframeColumn}>
                  <h3>Long-term</h3>
                  {dreams
                    .filter(dream => dream.timeframe === 'long-term')
                    .map(dream => (
                      <div key={dream.id} className={styles.timelineDream}>
                        <div className={styles.dreamTitle}>{dream.title}</div>
                        <div className={styles.categoryBadge}>{dream.category}</div>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className={styles.experienceTab}>
            <CosmicDreamExperience
              dreams={dreams}
              categories={mockCategories}
              onDreamSelect={handleDreamSelect}
              activeDream={activeDream}
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className={styles.insightsTab}>
            {/* AI-Powered Insights */}
            <section className={styles.aiInsights}>
              <h2>Dream Insights</h2>
              {mockInsights.map(insight => (
                <div key={insight.id} className={styles.insightCard}>
                  <h3>{insight.title}</h3>
                  <p>{insight.description}</p>
                  {insight.relatedCategories && insight.relatedCategories.length > 0 && (
                    <div className={styles.relatedCategories}>
                      Related to: {insight.relatedCategories.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Resource Connection */}
            <section className={styles.resourceSection}>
              <h2>Recommended Resources</h2>
              <div className={styles.resourceCards}>
                {mockResources.map(resource => (
                  <div key={resource.id} className={styles.resourceCard}>
                    <h3>{resource.title}</h3>
                    <p>
                      Relevant to:{' '}
                      {resource.relevantDreamIds
                        .map(id => dreams.find(d => d.id === id)?.title)
                        .join(', ')}
                    </p>
                    <div className={styles.resourceType}>{resource.type}</div>
                    <button className={styles.resourceButton}>View {resource.type}</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className={styles.timelineTab}>
            {/* More detailed timeline view - placeholder for now */}
            <section className={styles.detailedTimeline}>
              <h2>Dream Journey Timeline</h2>
              <p>Extended timeline visualization will be implemented here.</p>
              <div className={styles.timelinePlaceholder}>
                This section will show a more detailed timeline of your dreams, including
                milestones, achievements, and a visual roadmap of your journey.
              </div>
            </section>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className={styles.journalTab}>
            {/* Dream Journal Integration */}
            <section className={styles.journalSection}>
              <h2>Dream Journal</h2>
              {journalEntries.map(entry => {
                const relatedDream = dreams.find(d => d.id === entry.dreamId);
                return (
                  <div key={entry.id} className={styles.journalEntry}>
                    <h3>Entry for "{relatedDream?.title}"</h3>
                    <p className={styles.journalDate}>{formatDate(entry.date)}</p>
                    <div className={styles.emotionBadge}>{entry.emotion}</div>
                    <p className={styles.journalContent}>{entry.content}</p>
                  </div>
                );
              })}
              <button className={styles.addEntryButton}>Add New Journal Entry</button>
            </section>
          </div>
        )}
      </main>

      {/* Footer Tools Section */}
      <footer className={styles.toolsFooter}>
        <div className={styles.toolSection}>
          <h3>Dream Weather</h3>
          <p>{mockWeather.message}</p>
          <div className={styles.weatherStatus}>
            Overall: <span className={styles.weatherIcon}>{mockWeather.overall}</span>
          </div>
        </div>
        <div className={styles.toolSection}>
          <h3>Notifications</h3>
          <p>You have {mockNotifications.filter(n => !n.read).length} unread notifications.</p>
          <div className={styles.notificationPreview}>{mockNotifications[0].description}</div>
        </div>
        <div className={styles.toolSection}>
          <h3>Challenge Mode</h3>
          {mockChallenges.filter(c => !c.completed).length > 0 ? (
            <p>
              {mockChallenges.filter(c => !c.completed)[0].title}: Day{' '}
              {mockChallenges.filter(c => !c.completed)[0].currentDay} of{' '}
              {mockChallenges.filter(c => !c.completed)[0].duration}
            </p>
          ) : (
            <p>No active challenges. Start a new one!</p>
          )}
        </div>
      </footer>

      {/* Dream Board Modal */}
      <DreamBoardModal
        isOpen={isDreamBoardModalOpen}
        onClose={() => setIsDreamBoardModalOpen(false)}
        categories={DEFAULT_LIFE_CATEGORIES}
      />

      {/* Milestones Management Popup */}
      {showMilestonesPopup && selectedDream && (
        <div className={styles.modalOverlay} onClick={() => setShowMilestonesPopup(false)}>
          <div className={styles.milestonesPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.milestonesPopupHeader}>
              <h3>Manage Milestones: {selectedDream.title}</h3>
              <button
                className={styles.closePopupButton}
                onClick={() => setShowMilestonesPopup(false)}
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            <div className={styles.milestonesPopupContent}>
              {/* Progress Summary */}
              <div className={styles.milestonesProgressSummary}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${selectedDream.progress * 100}%` }}
                  />
                </div>
                <p>
                  <strong>{Math.round(selectedDream.progress * 100)}% Complete:</strong>{' '}
                  {selectedDream.milestones.filter(m => m.completed).length} of{' '}
                  {selectedDream.milestones.length} milestones
                </p>
              </div>

              {/* Visualization Tabs - only show when not in form mode */}
              {!showMilestoneForm && selectedDream.milestones.length > 0 && (
                <div className={styles.visualizationTabs}>
                  <button
                    className={`${styles.vizTab} ${activeVizTab === 'timeline' ? styles.activeVizTab : ''}`}
                    onClick={() => setActiveVizTab(activeVizTab === 'timeline' ? null : 'timeline')}
                  >
                    Timeline View
                  </button>
                  <button
                    className={`${styles.vizTab} ${activeVizTab === 'chart' ? styles.activeVizTab : ''}`}
                    onClick={() => setActiveVizTab(activeVizTab === 'chart' ? null : 'chart')}
                  >
                    Progress Chart
                  </button>
                  <button
                    className={`${styles.vizTab} ${activeVizTab === 'achievements' ? styles.activeVizTab : ''}`}
                    onClick={() =>
                      setActiveVizTab(activeVizTab === 'achievements' ? null : 'achievements')
                    }
                  >
                    Achievements
                  </button>
                </div>
              )}

              {/* Visualization Content */}
              {!showMilestoneForm && (
                <>
                  {/* Timeline Visualization */}
                  {activeVizTab === 'timeline' && (
                    <div className={styles.timelineVisualization}>
                      <h4>Milestone Timeline</h4>

                      {selectedDream.milestones.some(m => m.date) ? (
                        <div className={styles.timelineContainer}>
                          {/* Timeline axis */}
                          <div className={styles.timelineAxis}>
                            {/* Time markers */}
                            <div className={styles.timeMarker} style={{ left: '0%' }}>
                              <div className={styles.markerLine}></div>
                              <div className={styles.markerLabel}>Now</div>
                            </div>
                            <div className={styles.timeMarker} style={{ left: '25%' }}>
                              <div className={styles.markerLine}></div>
                              <div className={styles.markerLabel}>Q1</div>
                            </div>
                            <div className={styles.timeMarker} style={{ left: '50%' }}>
                              <div className={styles.markerLine}></div>
                              <div className={styles.markerLabel}>Q2</div>
                            </div>
                            <div className={styles.timeMarker} style={{ left: '75%' }}>
                              <div className={styles.markerLine}></div>
                              <div className={styles.markerLabel}>Q3</div>
                            </div>
                            <div className={styles.timeMarker} style={{ left: '100%' }}>
                              <div className={styles.markerLine}></div>
                              <div className={styles.markerLabel}>Q4</div>
                            </div>

                            {/* Milestones on timeline */}
                            {selectedDream.milestones
                              .filter(m => m.date)
                              .sort((a, b) => {
                                // Safe handling of dates without non-null assertions
                                const dateA = a.date ? new Date(a.date).getTime() : 0;
                                const dateB = b.date ? new Date(b.date).getTime() : 0;
                                return dateA - dateB;
                              })
                              .map(milestone => {
                                // Calculate position based on date (simplified for demo)
                                // In a real implementation, calculate position based on date range
                                const today = new Date();
                                const milestoneDate = milestone.date
                                  ? new Date(milestone.date)
                                  : today;
                                const daysDiff = Math.max(
                                  0,
                                  (milestoneDate.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );
                                const position = Math.min(100, Math.max(0, (daysDiff / 365) * 100));

                                return (
                                  <div
                                    key={milestone.id}
                                    className={`${styles.timelinePoint} ${milestone.completed ? styles.completedPoint : ''}`}
                                    style={{ left: `${position}%` }}
                                  >
                                    <div className={styles.pointConnector}></div>
                                    <div className={styles.pointDot}></div>
                                    <div className={styles.pointContent}>
                                      <div className={styles.pointTitle}>{milestone.title}</div>
                                      <div className={styles.pointDate}>
                                        {formatDisplayDate(milestone.date)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.emptyVisualization}>
                          <p>
                            No milestone dates set. Add target dates to your milestones to see a
                            timeline.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Chart */}
                  {activeVizTab === 'chart' && (
                    <div className={styles.chartVisualization}>
                      <h4>Progress Chart</h4>

                      {milestoneHistory.filter(h => h.dreamId === selectedDream.id).length > 0 ? (
                        <div className={styles.progressChartContainer}>
                          {(() => {
                            const chartData = getProgressChartData(selectedDream.id);
                            const chartWidth = 600;
                            const chartHeight = 200;

                            return (
                              <svg
                                width="100%"
                                height={chartHeight}
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                preserveAspectRatio="none"
                              >
                                {/* Grid lines */}
                                <line
                                  x1="0"
                                  y1={chartHeight}
                                  x2={chartWidth}
                                  y2={chartHeight}
                                  stroke="rgba(255,255,255,0.1)"
                                />
                                <line
                                  x1="0"
                                  y1={chartHeight / 2}
                                  x2={chartWidth}
                                  y2={chartHeight / 2}
                                  stroke="rgba(255,255,255,0.1)"
                                />
                                <line
                                  x1="0"
                                  y1="0"
                                  x2={chartWidth}
                                  y2="0"
                                  stroke="rgba(255,255,255,0.1)"
                                />

                                {/* Chart line */}
                                {chartData.length > 1 && (
                                  <path
                                    d={generateProgressChartPath(
                                      chartData,
                                      chartWidth,
                                      chartHeight
                                    )}
                                    stroke="#4caf50"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                )}

                                {/* Data points */}
                                {chartData.map((point, i) => {
                                  const minDate = chartData[0].date;
                                  const maxDate = chartData[chartData.length - 1].date;
                                  const timeRange = maxDate.getTime() - minDate.getTime();
                                  const x =
                                    chartWidth *
                                    ((point.date.getTime() - minDate.getTime()) / timeRange);
                                  const y = chartHeight - (point.percentage / 100) * chartHeight;

                                  return <circle key={i} cx={x} cy={y} r="5" fill="#4caf50" />;
                                })}

                                {/* Y-axis labels */}
                                <text x="5" y="15" fill="white" fontSize="12">
                                  100%
                                </text>
                                <text x="5" y={chartHeight / 2 + 15} fill="white" fontSize="12">
                                  50%
                                </text>
                                <text x="5" y={chartHeight - 5} fill="white" fontSize="12">
                                  0%
                                </text>
                              </svg>
                            );
                          })()}

                          <div className={styles.chartLabels}>
                            <div>Milestone Completion Progress</div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.emptyVisualization}>
                          <p>
                            Not enough data for a progress chart. Mark milestones as complete to
                            track your progress over time.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Achievements/Badges */}
                  {activeVizTab === 'achievements' && (
                    <div className={styles.achievementsVisualization}>
                      <h4>Achievements</h4>

                      <div className={styles.badgeGrid}>
                        {achievementBadges.map(badge => {
                          const isEarned = badge.condition(selectedDream);
                          return (
                            <div
                              key={badge.id}
                              className={`${styles.achievementBadge} ${isEarned ? styles.earnedBadge : styles.unearnedBadge}`}
                            >
                              <div className={styles.badgeIcon}>{badge.icon}</div>
                              <div className={styles.badgeTitle}>{badge.title}</div>
                              <div className={styles.badgeDescription}>{badge.description}</div>
                              {!isEarned && <div className={styles.badgeLock}>🔒</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Milestone Form (visible when adding/editing) */}
              {showMilestoneForm ? (
                <div className={styles.milestoneFormContainer}>
                  <div className={styles.milestoneFormHeader}>
                    <h4>{milestoneAction === 'add' ? 'Add New Milestone' : 'Edit Milestone'}</h4>
                    <button
                      className={styles.closeFormButton}
                      onClick={handleCancelMilestoneForm}
                      aria-label="Close form"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSaveMilestone}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">Title (required)</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        defaultValue={currentMilestone?.title || ''}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="description">Description (optional)</label>
                      <textarea
                        id="description"
                        name="description"
                        defaultValue={currentMilestone?.description || ''}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="date">Target Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        defaultValue={
                          currentMilestone?.date
                            ? new Date(currentMilestone.date).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={handleCancelMilestoneForm}
                      >
                        Cancel
                      </button>
                      <button type="submit" className={styles.saveButton}>
                        {milestoneAction === 'add' ? 'Add Milestone' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Milestone List (visible when not adding/editing) */
                <div className={styles.milestonesContainer}>
                  <div className={styles.milestoneSectionHeader}>
                    <h4>Milestones</h4>
                    <button
                      className={styles.addMilestoneButton}
                      onClick={() => handleInitiateMilestoneAction('add')}
                    >
                      + Add Milestone
                    </button>
                  </div>

                  {selectedDream.milestones.length > 0 ? (
                    <ul className={styles.milestoneList}>
                      {selectedDream.milestones.map(milestone => (
                        <li key={milestone.id} className={styles.milestoneItem}>
                          <div className={styles.milestoneCheckboxContainer}>
                            <input
                              type="checkbox"
                              id={`milestone-${milestone.id}`}
                              checked={milestone.completed}
                              onChange={e =>
                                handleMilestoneComplete(
                                  selectedDream.id,
                                  milestone.id,
                                  e.target.checked
                                )
                              }
                              className={styles.milestoneCheckbox}
                            />
                            <label
                              htmlFor={`milestone-${milestone.id}`}
                              className={styles.milestoneLabel}
                            >
                              {milestone.title}
                            </label>
                          </div>

                          <div className={styles.milestoneDetails}>
                            <span className={styles.milestoneDate}>
                              {formatDisplayDate(milestone.date)}
                            </span>

                            <div className={styles.milestoneActions}>
                              <button
                                className={styles.editMilestoneButton}
                                onClick={() => handleInitiateMilestoneAction('edit', milestone)}
                                aria-label="Edit milestone"
                              >
                                ✏️
                              </button>
                              <button
                                className={styles.deleteMilestoneButton}
                                onClick={() =>
                                  handleDeleteMilestone(selectedDream.id, milestone.id)
                                }
                                aria-label="Delete milestone"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.emptyMilestones}>
                      <p>No milestones added yet. Add your first milestone to track progress!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Milestone History (only show when not in form mode) */}
              {!showMilestoneForm &&
                milestoneHistory.filter(h => h.dreamId === selectedDream.id).length > 0 && (
                  <div className={styles.milestoneHistorySection}>
                    <details>
                      <summary>Milestone History</summary>
                      <ul className={styles.milestoneHistoryList}>
                        {milestoneHistory
                          .filter(h => h.dreamId === selectedDream.id)
                          .sort(
                            (a, b) =>
                              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                          )
                          .map((historyItem, index) => {
                            const milestone = selectedDream.milestones.find(
                              m => m.id === historyItem.milestoneId
                            );
                            const milestoneTitle = milestone
                              ? milestone.title
                              : 'Deleted milestone';
                            const formattedTime = new Date(historyItem.timestamp).toLocaleString();

                            return (
                              <li key={index} className={styles.historyItem}>
                                <span className={styles.historyAction}>{historyItem.action}</span>
                                <span className={styles.historyMilestone}>{milestoneTitle}</span>
                                <span className={styles.historyTime}>{formattedTime}</span>
                              </li>
                            );
                          })}
                      </ul>
                    </details>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamBoardPage;
