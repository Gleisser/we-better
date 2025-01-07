import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ChevronDownIcon } from '@/components/common/icons';
import styles from './GoalsWidget.module.css';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { Goal, GoalCategory } from './types';
import { CATEGORY_CONFIG } from './config';

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

const GoalsWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const { theme } = useTimeBasedTheme();

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

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
              onClick={() => {/* TODO: Add goal handler */}}
              aria-label="Add new goal"
            >
              <PlusIcon className={styles.actionIcon} />
            </button>
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
                  <span className={styles.goalIcon}>
                    {CATEGORY_CONFIG[goal.category].icon}
                  </span>
                  <div className={styles.goalDetails}>
                    <h3 className={styles.goalTitle}>{goal.title}</h3>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalsWidget; 