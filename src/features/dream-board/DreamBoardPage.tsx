import React, { useState } from 'react';
import styles from './DreamBoardPage.module.css';
import { Dream, JournalEntry } from './types';
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

const DreamBoardPage: React.FC = () => {
  const [expandedMiniBoard, setExpandedMiniBoard] = useState(false);
  const [activeTab, setActiveTab] = useState('vision-board');
  const [dreams, setDreams] = useState<Dream[]>(mockDreams);
  const [journalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [activeDream, setActiveDream] = useState<Dream | null>(null);

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
        <section className={`${styles.miniBoard} ${expandedMiniBoard ? styles.expanded : ''}`}>
          <div className={styles.miniBoardHeader}>
            <h2>Quick Vision</h2>
            <button onClick={toggleMiniBoard}>{expandedMiniBoard ? 'Minimize' : 'Expand'}</button>
          </div>
          <div className={styles.miniBoardContent}>
            {dreams.slice(0, 3).map(dream => {
              // Get icon based on category
              const getIconForCategory = (category: string): string => {
                const icons: Record<string, string> = {
                  Travel: '✈️',
                  Skills: '🎯',
                  Finance: '💰',
                  Health: '💪',
                  Relationships: '❤️',
                  Career: '💼',
                  Education: '🎓',
                  Spirituality: '✨',
                };
                return icons[category] || '🌟';
              };

              return (
                <div key={dream.id} className={styles.miniDream}>
                  <div className={styles.dreamIcon}>{getIconForCategory(dream.category)}</div>

                  <div className={styles.dreamContentWrapper}>
                    <div className={styles.dreamTitle}>{dream.title}</div>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressIndicator}
                          style={{ width: `${dream.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.dreamStatus}>
                    <div className={styles.progressControls}>
                      <button
                        className={styles.progressButton}
                        onClick={e => {
                          e.stopPropagation();
                          updateDreamProgress(dream.id, -0.1);
                        }}
                        disabled={dream.progress <= 0}
                        aria-label="Decrease progress"
                      >
                        <span className={styles.buttonIcon}>-</span>
                      </button>
                      <div className={styles.progressValue}>
                        {Math.round(dream.progress * 100)}%
                      </div>
                      <button
                        className={styles.progressButton}
                        onClick={e => {
                          e.stopPropagation();
                          updateDreamProgress(dream.id, 0.1);
                        }}
                        disabled={dream.progress >= 1}
                        aria-label="Increase progress"
                      >
                        <span className={styles.buttonIcon}>+</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content Section */}
      <main className={styles.mainContent}>
        {activeTab === 'vision-board' && (
          <div className={styles.visionBoardTab}>
            {/* Dream Categories Dashboard */}
            <section className={styles.categoriesDashboard}>
              <h2>Dream Categories</h2>
              <div className={styles.categoriesGrid}>
                {mockCategories.map(category => (
                  <div key={category} className={styles.categoryCard}>
                    <h3>{category}</h3>
                    <div className={styles.dreamCount}>
                      {dreams.filter(dream => dream.category === category).length} dreams
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Progress Tracking Layer */}
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
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline Visualization - basic placeholder */}
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
    </div>
  );
};

export default DreamBoardPage;
