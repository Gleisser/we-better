import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream, Milestone } from '../../types';
import TimelineComponent from './TimelineComponent';

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
  getProgressChartData: (dreamId: string) => Array<{ date: Date; percentage: number }>;
  milestoneHistory: Array<MilestoneHistoryItem>;
  achievementBadges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (dream: Dream) => boolean;
  }>;
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
}) => {
  if (!showMilestonesPopup || !selectedDream) return null;

  return (
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
                    <TimelineComponent
                      milestones={selectedDream.milestones}
                      formatDisplayDate={formatDisplayDate}
                      dreamTitle={selectedDream.title}
                    />
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
                                d={generateProgressChartPath(chartData, chartWidth, chartHeight)}
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
                        Not enough data for a progress chart. Mark milestones as complete to track
                        your progress over time.
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
                            onClick={() => handleDeleteMilestone(selectedDream.id, milestone.id)}
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
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                      )
                      .map((historyItem, index) => {
                        const milestone = selectedDream.milestones.find(
                          m => m.id === historyItem.milestoneId
                        );
                        const milestoneTitle = milestone ? milestone.title : 'Deleted milestone';
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
