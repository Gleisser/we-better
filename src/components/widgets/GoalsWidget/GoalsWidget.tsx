import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ChevronDownIcon, SettingsIcon, DotsHorizontalIcon } from '@/components/common/icons';
import styles from './GoalsWidget.module.css';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { Goal, GoalCategory, ReviewSettings } from './types';
import { CATEGORY_CONFIG } from './config';
import { format, differenceInDays } from 'date-fns';
import { ReviewSettingsModal } from './ReviewSettings';
import { GoalFormModal } from './GoalFormModal';
import { toast } from 'react-hot-toast';
import { GoalActionsMenu } from './GoalActionsMenu';
import { ConfirmationModal } from './ConfirmationModal';

const MOCK_GOALS: Goal[] = [
  {
    id: 'goal_1',
    title: 'Learn React Native',
    category: 'learning',
    progress: 45,
    targetDate: '2024-06-30',
    milestones: [
      { id: '1', title: 'Complete basic tutorial', completed: true },
      { id: '2', title: 'Build first app', completed: false },
      { id: '3', title: 'Publish to App Store', completed: false },
    ]
  },
  {
    id: 'goal_2',
    title: 'Run a Marathon',
    category: 'fitness',
    progress: 30,
    targetDate: '2024-12-31',
    milestones: [
      { id: '1', title: 'Run 5K', completed: true },
      { id: '2', title: 'Run 10K', completed: false },
      { id: '3', title: 'Run Half Marathon', completed: false },
    ]
  }
];

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const GoalsWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const { theme } = useTimeBasedTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    frequency: 'weekly',
    notifications: ['email'],
    nextReviewDate: '2024-03-24',
    reminderDays: 3
  });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  const nextReviewDate = new Date('2025-01-08'); // This would come from your settings/backend
  const daysUntilReview = differenceInDays(nextReviewDate, new Date());

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    toast.success('Goal deleted successfully', {
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
  };

  return (
    <div 
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      style={{
        '--gradient-start': theme.gradientStart,
        '--gradient-middle': theme.gradientMiddle,
        '--gradient-end': theme.gradientEnd,
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🎯</span>
            <span className={styles.headerText}>Goals Tracking</span>
            <button 
              className={styles.addButton}
              onClick={() => setShowGoalForm(true)}
              aria-label="Add new goal"
            >
              <PlusIcon className={styles.actionIcon} />
            </button>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.settingsButton}
              onClick={() => setShowSettings(true)}
              aria-label="Review settings"
            >
              <SettingsIcon className={styles.actionIcon} />
            </button>

            <div className={`${styles.reviewTimer} ${isToday(nextReviewDate) ? styles.active : ''}`}>
              <div className={styles.timerIcon}>⏰</div>
              <div className={styles.timerInfo}>
                <span className={styles.timerLabel}>Next Goals Review</span>
                <span className={styles.timerValue}>
                  {daysUntilReview > 0 ? (
                    <>in {daysUntilReview} days</>
                  ) : (
                    <>Today</>
                  )}
                </span>
                <span className={styles.timerDate}>
                  {format(nextReviewDate, 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <button
              className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand goals widget" : "Collapse goals widget"}
            >
              <ChevronDownIcon className={styles.collapseIcon} />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        className={styles.collapsibleContent}
        animate={{
          height: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <div className={styles.categorySelector}>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === 'all' ? styles.selected : ''
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            All
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
              <span className={styles.categoryLabel}>{config.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.goalsList}>
            {filteredGoals.map(goal => (
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
                    <div className={styles.progressText}>
                      {goal.progress}%
                    </div>
                  </div>

                  <div className={styles.goalContent}>
                    <div className={styles.goalHeader}>
                      <span className={styles.goalIcon}>
                        {CATEGORY_CONFIG[goal.category].icon}
                      </span>
                      <h3 className={styles.goalTitle}>{goal.title}</h3>
                    </div>
                    <div className={styles.goalActions}>
                      <button 
                        className={styles.actionButton}
                        aria-label="Update progress"
                      >
                        <PlusIcon className={styles.actionIcon} />
                      </button>
                      <button 
                        className={styles.actionButton}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setActionMenuPosition({
                            x: Math.min(rect.left, window.innerWidth - 144), // 144px = menu width
                            y: rect.bottom + 8
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
          </div>
        </div>
      </motion.div>

      {showSettings && (
        <ReviewSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={reviewSettings}
          onSave={(newSettings) => {
            setReviewSettings(newSettings);
            // TODO: Save to backend
          }}
        />
      )}

      {showGoalForm && (
        <GoalFormModal
          isOpen={showGoalForm}
          onClose={() => setShowGoalForm(false)}
          onSave={(newGoal) => {
            setGoals(prev => [
              ...prev,
              { 
                ...newGoal, 
                id: `goal-${Date.now()}` 
              }
            ]);
            
            toast.success('New goal created successfully!', {
              duration: 4000,
              position: 'top-center',
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
            
            // TODO: Save to backend
          }}
        />
      )}

      {showActionsMenu && selectedGoal && (
        <GoalActionsMenu
          isOpen={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          onEdit={() => {
            // TODO: Implement edit functionality
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