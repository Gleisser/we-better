import React, { useState, useEffect } from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream, Milestone } from '../../types';
import TimelineComponent from './TimelineComponent';
import { calculateProgress, getPercentage } from '../../utils/progressUtils';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';

interface MilestoneHistoryItem {
  dreamId: string;
  milestoneId: string;
  action: string;
  timestamp: string;
}

interface MilestonesPopupProps {
  selectedDream: Dream;
  showMilestonesPopup: boolean;
  showMilestoneForm: boolean;
  setShowMilestonesPopup: (show: boolean) => void;
  milestoneAction: 'add' | 'edit' | null;
  currentMilestone: Milestone | null;
  activeVizTab: 'timeline' | 'chart' | 'achievements' | null;
  setActiveVizTab: (tab: 'timeline' | 'chart' | 'achievements' | null) => void;
  handleMilestoneComplete: (dreamId: string, milestoneId: string, isComplete: boolean) => void;
  handleDeleteMilestone: (dreamId: string, milestoneId: string) => void;
  handleInitiateMilestoneAction: (action: 'add' | 'edit', milestone?: Milestone | null) => void;
  handleSaveMilestone: (e: React.FormEvent) => void;
  handleCancelMilestoneForm: () => void;
  formatDisplayDate: (dateString?: string) => string;
  generateProgressChartPath: (
    dataPoints: Array<{ date: Date; percentage: number }>,
    width: number,
    height: number
  ) => string;
  getProgressChartData: (dreamId: string) => Promise<Array<{ date: Date; percentage: number }>>;
  milestoneHistory: Array<MilestoneHistoryItem>;
  achievementBadges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (dream: Dream) => boolean;
  }>;
  fetchedMilestones?: Milestone[];
}

const MilestonesPopup: React.FC<MilestonesPopupProps> = ({
  selectedDream,
  showMilestonesPopup,
  showMilestoneForm,
  setShowMilestonesPopup,
  milestoneAction,
  currentMilestone,
  activeVizTab,
  setActiveVizTab,
  handleMilestoneComplete,
  handleDeleteMilestone,
  handleInitiateMilestoneAction,
  handleSaveMilestone,
  handleCancelMilestoneForm,
  formatDisplayDate,
  generateProgressChartPath,
  getProgressChartData,
  milestoneHistory,
  achievementBadges,
  fetchedMilestones,
}) => {
  const { t } = useCommonTranslation();

  // State for async chart data (must be at the top level)
  const [chartData, setChartData] = useState<Array<{ date: Date; percentage: number }>>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Fetch chart data when the chart tab is active
  useEffect(() => {
    if (activeVizTab === 'chart' && selectedDream) {
      setIsLoadingChart(true);
      setChartError(null);

      getProgressChartData(selectedDream.id)
        .then(data => {
          setChartData(data);
        })
        .catch(error => {
          console.error('❌ Error loading chart data:', error);
          setChartError('Failed to load progress chart data');
          setChartData([]);
        })
        .finally(() => {
          setIsLoadingChart(false);
        });
    }
  }, [activeVizTab, selectedDream?.id, getProgressChartData, selectedDream]);

  if (!showMilestonesPopup || !selectedDream) return null;

  const milestones = fetchedMilestones || selectedDream.milestones;

  // Create a modified dream object with current milestone data for achievement evaluation
  const dreamWithCurrentData = {
    ...selectedDream,
    milestones,
    progress:
      milestones.length > 0 ? milestones.filter(m => m.completed).length / milestones.length : 0,
  };

  return (
    <div className={styles.modalOverlay} onClick={() => setShowMilestonesPopup(false)}>
      <div className={styles.milestonesPopup} onClick={e => e.stopPropagation()}>
        <div className={styles.milestonesPopupHeader}>
          <h3>{t('dreamBoard.milestones.manageTitle', { dreamTitle: selectedDream.title })}</h3>
          <button
            className={styles.closePopupButton}
            onClick={() => setShowMilestonesPopup(false)}
            aria-label={t('dreamBoard.milestones.closePopup') as string}
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
                style={{
                  width: `${getPercentage(calculateProgress(milestones, false))}%`,
                  backgroundColor: '#4caf50',
                }}
              />
            </div>
            <p>
              {t('dreamBoard.milestones.progressSummary', {
                completed: milestones.filter(m => m.completed).length,
                total: milestones.length,
                percentage: getPercentage(calculateProgress(milestones, false)),
              })}
            </p>
          </div>

          {/* Visualization Tabs - only show when not in form mode */}
          {!showMilestoneForm && milestones.length > 0 && (
            <div className={styles.visualizationTabs}>
              <button
                className={`${styles.vizTab} ${activeVizTab === 'timeline' ? styles.activeVizTab : ''}`}
                onClick={() => setActiveVizTab(activeVizTab === 'timeline' ? null : 'timeline')}
              >
                {t('dreamBoard.milestones.tabs.timeline')}
              </button>
              <button
                className={`${styles.vizTab} ${activeVizTab === 'chart' ? styles.activeVizTab : ''}`}
                onClick={() => setActiveVizTab(activeVizTab === 'chart' ? null : 'chart')}
              >
                {t('dreamBoard.milestones.tabs.chart')}
              </button>
              <button
                className={`${styles.vizTab} ${activeVizTab === 'achievements' ? styles.activeVizTab : ''}`}
                onClick={() =>
                  setActiveVizTab(activeVizTab === 'achievements' ? null : 'achievements')
                }
              >
                {t('dreamBoard.milestones.tabs.achievements')}
              </button>
            </div>
          )}

          {/* Visualization Content */}
          {!showMilestoneForm && (
            <>
              {/* Timeline Visualization */}
              {activeVizTab === 'timeline' && (
                <div className={styles.timelineVisualization}>
                  <h4>{t('dreamBoard.milestones.timeline.title')}</h4>
                  {milestones.some(m => m.date) ? (
                    <TimelineComponent
                      milestones={milestones}
                      formatDisplayDate={formatDisplayDate}
                      dreamTitle={selectedDream.title}
                      progress={calculateProgress(milestones, false)}
                    />
                  ) : (
                    <div className={styles.emptyVisualization}>
                      <p>{t('dreamBoard.milestones.timeline.noDates')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Chart */}
              {activeVizTab === 'chart' && (
                <div className={styles.chartVisualization}>
                  <h4>{t('dreamBoard.milestones.chart.title')}</h4>

                  {isLoadingChart ? (
                    <div className={styles.emptyVisualization}>
                      <p>{t('dreamBoard.milestones.chart.loading')}</p>
                    </div>
                  ) : chartError ? (
                    <div className={styles.emptyVisualization}>
                      <p>{t('dreamBoard.milestones.chart.error', { error: chartError })}</p>
                    </div>
                  ) : chartData.length > 0 ? (
                    <div className={styles.progressChartContainer}>
                      {(() => {
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
                            <path
                              d={generateProgressChartPath(chartData, chartWidth, chartHeight)}
                              stroke="#4caf50"
                              strokeWidth="2"
                              fill="none"
                            />

                            {/* Data points */}
                            {chartData.map((point, index) => {
                              const x =
                                chartWidth *
                                ((point.date.getTime() - chartData[0].date.getTime()) /
                                  (chartData[chartData.length - 1].date.getTime() -
                                    chartData[0].date.getTime()));
                              const y = chartHeight - (point.percentage / 100) * chartHeight;
                              return (
                                <circle
                                  key={index}
                                  cx={x}
                                  cy={y}
                                  r="3"
                                  fill="#4caf50"
                                  stroke="white"
                                  strokeWidth="1"
                                />
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className={styles.emptyVisualization}>
                      <p>{t('dreamBoard.milestones.chart.noMilestones')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Achievements */}
              {activeVizTab === 'achievements' && (
                <div className={styles.achievementsVisualization}>
                  <h4>{t('dreamBoard.milestones.achievements.title')}</h4>
                  <div className={styles.achievementBadges}>
                    {achievementBadges.map(badge => {
                      const isEarned = badge.condition(dreamWithCurrentData);
                      return (
                        <div
                          key={badge.id}
                          className={`${styles.achievementBadge} ${
                            isEarned ? styles.earnedBadge : styles.unearnedBadge
                          }`}
                        >
                          <div className={styles.badgeIcon}>
                            {isEarned ? (
                              badge.icon
                            ) : (
                              <>
                                <span style={{ opacity: 0.3 }}>{badge.icon}</span>
                                <div className={styles.badgeLock}>🔒</div>
                              </>
                            )}
                          </div>
                          <div className={styles.badgeInfo}>
                            <h5 className={styles.badgeTitle}>{badge.title}</h5>
                            <p className={styles.badgeDescription}>{badge.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {showMilestoneForm ? (
            <div className={styles.milestoneFormContainer}>
              <div className={styles.milestoneFormHeader}>
                <h4>
                  {milestoneAction === 'add'
                    ? t('dreamBoard.milestones.form.addTitle')
                    : t('dreamBoard.milestones.form.editTitle')}
                </h4>
                <button
                  className={styles.closeFormButton}
                  onClick={handleCancelMilestoneForm}
                  aria-label={t('dreamBoard.milestones.form.closeForm') as string}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveMilestone}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">{t('dreamBoard.milestones.form.titleLabel')}</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    defaultValue={currentMilestone?.title || ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">
                    {t('dreamBoard.milestones.form.descriptionLabel')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={currentMilestone?.description || ''}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="date">{t('dreamBoard.milestones.form.targetDateLabel')}</label>
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
                    {t('dreamBoard.milestones.form.cancel')}
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    {milestoneAction === 'add'
                      ? t('dreamBoard.milestones.form.addButton')
                      : t('dreamBoard.milestones.form.saveButton')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Milestone List (visible when not adding/editing) */
            <div className={styles.milestonesContainer}>
              <div className={styles.milestoneSectionHeader}>
                <h4>{t('dreamBoard.milestones.list.title')}</h4>
                <button
                  className={styles.addMilestoneButton}
                  onClick={() => handleInitiateMilestoneAction('add')}
                >
                  {t('dreamBoard.milestones.list.addButton')}
                </button>
              </div>

              {milestones.length > 0 ? (
                <ul className={styles.milestoneList}>
                  {milestones.map(milestone => (
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
                            aria-label={t('dreamBoard.milestones.list.editMilestone') as string}
                          >
                            ✏️
                          </button>
                          <button
                            className={styles.deleteMilestoneButton}
                            onClick={() => handleDeleteMilestone(selectedDream.id, milestone.id)}
                            aria-label={t('dreamBoard.milestones.list.deleteMilestone') as string}
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
                  <p>{t('dreamBoard.milestones.list.emptyState')}</p>
                </div>
              )}
            </div>
          )}

          {/* Milestone History (only show when not in form mode) */}
          {!showMilestoneForm &&
            milestoneHistory.filter(h => h.dreamId === selectedDream.id).length > 0 && (
              <div className={styles.milestoneHistorySection}>
                <details>
                  <summary>{t('dreamBoard.milestones.history.title')}</summary>
                  <ul className={styles.milestoneHistoryList}>
                    {milestoneHistory
                      .filter(h => h.dreamId === selectedDream.id)
                      .sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                      )
                      .map((historyItem, index) => {
                        const milestone = milestones.find(m => m.id === historyItem.milestoneId);
                        const milestoneTitle = milestone
                          ? milestone.title
                          : t('dreamBoard.milestones.history.deletedMilestone');
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
  );
};

export default MilestonesPopup;
