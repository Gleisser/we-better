import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import {
  PlusIcon,
  ChevronDownIcon,
  SettingsIcon,
  DotsHorizontalIcon,
  ProgressUpIcon,
  ProgressDownIcon,
} from '@/shared/components/common/icons';
import styles from './GoalsWidget.module.css';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { Goal, GoalCategory, ReviewSettings, ReviewFrequency } from './types.js';
import { CATEGORY_CONFIG } from './config.js';
import { ReviewSettingsModal } from './ReviewSettings.js';
import { GoalFormModal } from './GoalFormModal.js';
import { toast } from 'react-hot-toast';
import { GoalActionsMenu } from './GoalActionsMenu.js';
import { ConfirmationModal } from './ConfirmationModal.js';
import { ReviewTimer } from './ReviewTimer.js';
import { useGoals } from '@/shared/hooks/useGoals';
import {
  GoalWithMilestones as ApiGoalWithMilestones,
  UserReviewSettings as ApiReviewSettings,
  ReviewFrequency as ApiReviewFrequency,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '@/core/services/goalsService';

const INITIAL_GOALS_TO_SHOW = 3; // Start with 3 goals on mobile

// Helper function to transform API Goal to local Goal format
const transformApiGoal = (apiGoal: ApiGoalWithMilestones): Goal => {
  return {
    id: apiGoal.id,
    title: apiGoal.title,
    category: apiGoal.category as GoalCategory,
    progress: apiGoal.progress,
    targetDate: apiGoal.target_date || '',
    milestones: apiGoal.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      completed: milestone.completed,
    })),
  };
};

// Helper function to transform API ReviewSettings to local format
const transformApiReviewSettings = (apiSettings: ApiReviewSettings): ReviewSettings => {
  const notificationMethods = Object.entries(apiSettings.notification_preferences)
    .filter(([_, enabled]) => enabled)
    .map(([method, _]) => method as 'email' | 'sms' | 'push' | 'none');

  // Map API frequency to local frequency (both now use 'daily', 'weekly', 'monthly')
  const localFrequency = apiSettings.frequency;

  return {
    frequency: localFrequency as ReviewFrequency,
    notifications: notificationMethods as ('email' | 'sms' | 'push' | 'none')[],
    nextReviewDate: apiSettings.next_review_date || '',
    reminderDays: apiSettings.reminder_days || 3,
  };
};

// Helper function to transform local ReviewSettings to API format
const transformToApiReviewSettings = (
  localSettings: ReviewSettings
): {
  frequency: ApiReviewFrequency;
  notification_preferences: Record<string, boolean>;
  next_review_date?: string;
  reminder_days?: number;
} => {
  const notification_preferences: Record<string, boolean> = {
    email: false,
    sms: false,
    push: false,
    none: false,
  };

  localSettings.notifications.forEach(method => {
    notification_preferences[method] = true;
  });

  return {
    frequency: localSettings.frequency as ApiReviewFrequency,
    notification_preferences,
    next_review_date: localSettings.nextReviewDate,
    reminder_days: localSettings.reminderDays,
  };
};

const GoalsWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = (): void => {
      const isMobile = window.innerWidth <= 768;
      setIsCollapsed(isMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
  const { theme } = useTimeBasedTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [visibleGoals, setVisibleGoals] = useState(INITIAL_GOALS_TO_SHOW);

  // Use the goals hook for API integration
  const {
    goals: apiGoals,
    reviewSettings: apiReviewSettings,
    isLoading,
    error,
    fetchGoals,
    createGoal: apiCreateGoal,
    updateGoal: apiUpdateGoal,
    deleteGoal: apiDeleteGoal,
    increaseGoalProgress,
    decreaseGoalProgress,
    saveReviewSettings,
    fetchReviewSettings,
    completeReview,
  } = useGoals();

  // Transform API goals to local format
  const goals: Goal[] = apiGoals.map(transformApiGoal);

  // Transform API review settings to local format
  const reviewSettings: ReviewSettings = apiReviewSettings
    ? transformApiReviewSettings(apiReviewSettings)
    : {
        frequency: 'weekly',
        notifications: ['email'],
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
        reminderDays: 3,
      };

  // Initialize based on selected category
  useEffect(() => {
    fetchGoals(selectedCategory === 'all' ? undefined : selectedCategory, true);
  }, [fetchGoals, selectedCategory]);

  // Fetch review settings on mount
  useEffect(() => {
    fetchReviewSettings();
  }, [fetchReviewSettings]);

  const filteredGoals =
    selectedCategory === 'all' ? goals : goals.filter(goal => goal.category === selectedCategory);

  const displayedGoals = filteredGoals.slice(0, visibleGoals);

  const handleLoadMore = (): void => {
    setVisibleGoals(prev => prev + 3); // Load 3 more goals
  };

  const nextReviewDate = new Date(reviewSettings.nextReviewDate || '2025-01-08');

  const handleDeleteGoal = useCallback(
    async (goalId: string): Promise<void> => {
      try {
        await apiDeleteGoal(goalId);
        toast.success(t('widgets.goals.toasts.goalDeleted') as string, {
          icon: '🗑️',
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            maxWidth: '400px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
          },
        });
      } catch (error) {
        console.error('Failed to delete goal:', error);
        toast.error(t('widgets.goals.toasts.failedToDelete') as string);
      }
    },
    [apiDeleteGoal, t]
  );

  /**
   * Handle milestone changes during goal editing
   */
  const handleMilestoneChanges = async (
    goalId: string,
    originalMilestones: Goal['milestones'],
    newMilestones: Goal['milestones']
  ): Promise<void> => {
    // Create maps for easier comparison
    const originalMap = new Map(originalMilestones.map(m => [m.id, m]));
    const newMap = new Map(newMilestones.map(m => [m.id, m]));

    // Find milestones to create (new temporary IDs starting with 'm-')
    const toCreate = newMilestones.filter(m => m.id.startsWith('m-'));

    // Find milestones to update (existing IDs with changes)
    const toUpdate = newMilestones.filter(m => {
      if (m.id.startsWith('m-')) return false; // Skip new ones
      const original = originalMap.get(m.id);
      return original && (original.title !== m.title || original.completed !== m.completed);
    });

    // Find milestones to delete (in original but not in new)
    const toDelete = originalMilestones.filter(m => !newMap.has(m.id));

    try {
      // Create new milestones
      for (const milestone of toCreate) {
        await createMilestone(goalId, milestone.title, milestone.completed);
      }

      // Update existing milestones
      for (const milestone of toUpdate) {
        await updateMilestone(goalId, milestone.id, {
          title: milestone.title,
          completed: milestone.completed,
        });
      }

      // Delete removed milestones
      for (const milestone of toDelete) {
        await deleteMilestone(goalId, milestone.id);
      }
    } catch (error) {
      console.error('Error handling milestone changes:', error);
      throw error;
    }
  };

  const handleEditGoal = useCallback(
    async (updatedGoal: Omit<Goal, 'id'>): Promise<void> => {
      if (!editingGoal || editingGoal.id === 'temp') return;

      try {
        // Update the goal itself
        await apiUpdateGoal(editingGoal.id, {
          title: updatedGoal.title,
          category: updatedGoal.category,
          progress: updatedGoal.progress,
          target_date: updatedGoal.targetDate,
        });

        // Handle milestone changes
        await handleMilestoneChanges(
          editingGoal.id,
          editingGoal.milestones || [],
          updatedGoal.milestones || []
        );

        // Refetch goals to get updated milestones
        await fetchGoals(selectedCategory === 'all' ? undefined : selectedCategory, true);

        toast.success('Goal updated successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            maxWidth: '400px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
          },
          icon: '✏️',
        });
      } catch (error) {
        console.error('Failed to update goal:', error);
        toast.error('Failed to update goal');
      }
    },
    [apiUpdateGoal, editingGoal, fetchGoals, selectedCategory]
  );

  const handleCreateGoal = useCallback(
    async (goalData: Omit<Goal, 'id'>): Promise<void> => {
      try {
        // First create the goal
        const newGoal = await apiCreateGoal(goalData.title, goalData.category, goalData.targetDate);

        if (!newGoal) {
          throw new Error('Failed to create goal');
        }

        // Then create milestones if any exist
        if (goalData.milestones && goalData.milestones.length > 0) {
          for (const milestone of goalData.milestones) {
            try {
              await createMilestone(newGoal.id, milestone.title, milestone.completed);
            } catch (milestoneError) {
              console.error('Failed to create milestone:', milestone.title, milestoneError);
              // Continue creating other milestones even if one fails
            }
          }
        }

        toast.success(t('widgets.goals.toasts.goalCreated') as string, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            maxWidth: '400px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
          },
          icon: '🎯',
        });
      } catch (error) {
        console.error('Failed to create goal:', error);
        toast.error(t('widgets.goals.toasts.failedToCreate') as string);
      }
    },
    [apiCreateGoal, t]
  );

  return (
    <div
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      style={
        {
          '--gradient-start': theme.gradientStart,
          '--gradient-middle': theme.gradientMiddle,
          '--gradient-end': theme.gradientEnd,
        } as React.CSSProperties
      }
    >
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🎯</span>
            <span className={styles.headerText}>{t('widgets.goals.title')}</span>
            <button
              className={styles.addButton}
              onClick={() => setShowGoalForm(true)}
              aria-label={t('widgets.goals.addNew') as string}
            >
              <PlusIcon className={styles.actionIcon} />
            </button>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.settingsButton}
              onClick={() => setShowSettings(true)}
              aria-label={t('widgets.goals.reviewSettings') as string}
            >
              <SettingsIcon className={styles.actionIcon} />
            </button>

            <ReviewTimer
              nextReviewDate={nextReviewDate}
              onCompleteReview={async () => {
                try {
                  const updatedSettings = await completeReview();
                  const nextReview = new Date(updatedSettings.next_review_date || '');
                  const formattedDate = format(nextReview, 'MMM d, yyyy');

                  toast.success(
                    t('widgets.goals.toasts.reviewCompleted', { date: formattedDate }) as string,
                    {
                      duration: 4000,
                      position: 'top-right',
                      style: {
                        background: '#1A1A1A',
                        color: '#fff',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        fontSize: '14px',
                        maxWidth: '400px',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                      },
                      icon: '✅',
                    }
                  );
                } catch (error) {
                  console.error('Failed to complete review:', error);
                  toast.error(t('widgets.goals.toasts.failedToComplete') as string);
                }
              }}
            />

            <button
              className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={
                (isCollapsed
                  ? t('widgets.goals.expandWidget')
                  : t('widgets.goals.collapseWidget')) as string
              }
            >
              <ChevronDownIcon className={styles.collapseIcon} />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        className={styles.collapsibleContent}
        animate={{
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        <div className={styles.categorySelector}>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === 'all' ? styles.selected : ''
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            {t('widgets.goals.categories.all')}
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
            <button
              key={category}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.selected : ''
              }`}
              onClick={() => setSelectedCategory(category as GoalCategory)}
            >
              <span className={styles.categoryIcon}>{config.icon}</span>
              <span className={styles.categoryLabel}>
                {t(`widgets.goals.categories.${category}`)}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {isLoading && <div className={styles.loadingIndicator}>{t('widgets.goals.loading')}</div>}
          {error && (
            <div className={styles.errorMessage}>
              {t('widgets.goals.errorLoading')}: {error.message}
            </div>
          )}

          {!isLoading && !error && filteredGoals.length === 0 && (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {selectedCategory === 'all' ? (
                <>
                  <motion.div
                    className={styles.emptyStateIcon}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    🎯
                  </motion.div>
                  <p>{t('widgets.goals.emptyState.all')}</p>
                  <motion.button
                    className={styles.createButton}
                    onClick={() => {
                      setEditingGoal(null);
                      setShowGoalForm(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('widgets.goals.emptyState.createButton')}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div
                    className={styles.emptyStateIcon}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {CATEGORY_CONFIG[selectedCategory as GoalCategory]?.icon || '🎯'}
                  </motion.div>
                  <p>
                    {t('widgets.goals.emptyState.category', {
                      category: t(`widgets.goals.categories.${selectedCategory}`),
                    })}
                  </p>
                  <motion.button
                    className={styles.createButton}
                    onClick={() => {
                      // Pre-populate with selected category
                      setEditingGoal({
                        id: 'temp',
                        title: '',
                        category: selectedCategory as GoalCategory,
                        progress: 0,
                        targetDate: '',
                        milestones: [],
                      });
                      setShowGoalForm(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('widgets.goals.emptyState.createCategoryButton', {
                      category: t(`widgets.goals.categories.${selectedCategory}`),
                    })}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          <div className={styles.goalsList}>
            {displayedGoals.map(goal => (
              <motion.div
                key={goal.id}
                className={styles.goalCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={styles.goalInfo}>
                  <div className={styles.progressCircle}>
                    <svg className={styles.progressSvg} viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeDasharray={`${goal.progress}, 100`}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#D946EF" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className={styles.progressText}>{goal.progress}%</div>
                  </div>

                  <div className={styles.goalContent}>
                    <div className={styles.goalHeader}>
                      <span className={styles.goalIcon}>{CATEGORY_CONFIG[goal.category].icon}</span>
                      <h3 className={styles.goalTitle}>{goal.title}</h3>
                      {goal.milestones && goal.milestones.length > 0 && (
                        <span className={styles.milestoneCount}>
                          {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length}{' '}
                          {t('widgets.goals.milestones.count')}
                        </span>
                      )}
                    </div>
                    <div className={styles.goalActions}>
                      <button
                        className={styles.actionButton}
                        onClick={async () => {
                          try {
                            await increaseGoalProgress(goal.id, 5);
                            toast.success(
                              `Progress increased to ${Math.min(100, goal.progress + 5)}%`,
                              {
                                duration: 2000,
                                position: 'top-right',
                                style: {
                                  background: '#1A1A1A',
                                  color: '#fff',
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                  borderRadius: '12px',
                                  padding: '16px 24px',
                                  fontSize: '14px',
                                  maxWidth: '400px',
                                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                                },
                                icon: '📈',
                              }
                            );
                          } catch (error) {
                            console.error('Failed to increase progress:', error);
                            toast.error('Failed to update progress');
                          }
                        }}
                        aria-label="Increase progress by 5%"
                      >
                        <ProgressUpIcon className={styles.actionIcon} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={async () => {
                          try {
                            await decreaseGoalProgress(goal.id, 5);
                            toast.success(
                              `Progress decreased to ${Math.max(0, goal.progress - 5)}%`,
                              {
                                duration: 2000,
                                position: 'top-right',
                                style: {
                                  background: '#1A1A1A',
                                  color: '#fff',
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                  borderRadius: '12px',
                                  padding: '16px 24px',
                                  fontSize: '14px',
                                  maxWidth: '400px',
                                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                                },
                                icon: '📉',
                              }
                            );
                          } catch (error) {
                            console.error('Failed to decrease progress:', error);
                            toast.error('Failed to update progress');
                          }
                        }}
                        aria-label="Decrease progress by 5%"
                      >
                        <ProgressDownIcon className={styles.actionIcon} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActionMenuPosition({
                            x: Math.min(rect.left, window.innerWidth - 144),
                            y: rect.bottom + 8,
                          });
                          setSelectedGoal(goal);
                          setShowActionsMenu(true);
                        }}
                        aria-label="More actions"
                      >
                        <DotsHorizontalIcon className={styles.actionIcon} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredGoals.length > visibleGoals && (
              <motion.button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Show More Goals ({filteredGoals.length - visibleGoals} remaining)
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {showSettings && (
        <ReviewSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={reviewSettings}
          onSave={async newSettings => {
            try {
              await saveReviewSettings(transformToApiReviewSettings(newSettings));
              toast.success('Review settings saved successfully');
            } catch (error) {
              console.error('Failed to save review settings:', error);
              toast.error('Failed to save review settings');
            }
          }}
        />
      )}

      {showGoalForm && (
        <GoalFormModal
          isOpen={showGoalForm}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          onSave={async goalData => {
            if (editingGoal && editingGoal.id !== 'temp') {
              await handleEditGoal(goalData);
            } else {
              await handleCreateGoal(goalData);
            }
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          initialGoal={
            editingGoal && editingGoal.id !== 'temp'
              ? editingGoal
              : editingGoal
                ? { ...editingGoal, id: '' }
                : null
          }
        />
      )}

      {showActionsMenu && selectedGoal && (
        <GoalActionsMenu
          isOpen={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          onEdit={() => {
            setEditingGoal(selectedGoal);
            setShowGoalForm(true);
            setShowActionsMenu(false);
          }}
          onDelete={() => {
            setGoalToDelete(selectedGoal);
            setShowDeleteConfirmation(true);
            setShowActionsMenu(false);
          }}
          position={actionMenuPosition}
        />
      )}

      {showDeleteConfirmation && goalToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setGoalToDelete(null);
          }}
          onConfirm={() => {
            handleDeleteGoal(goalToDelete.id);
            setShowDeleteConfirmation(false);
            setGoalToDelete(null);
          }}
          title="Delete Goal"
          message={`Are you sure you want to delete "${goalToDelete.title}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default GoalsWidget;
