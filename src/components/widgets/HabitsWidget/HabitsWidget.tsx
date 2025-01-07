import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './HabitsWidget.module.css';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { format, startOfWeek, addDays } from 'date-fns';
import { MonthlyView } from './MonthlyView';
import { ChartIcon } from '@/components/common/icons';

type HabitCategory = 'health' | 'growth' | 'lifestyle' | 'custom';

interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  streak: number;
  completedDays: string[]; // Array of dates in ISO format
}

const CATEGORY_CONFIG: Record<HabitCategory, {
  icon: string;
  label: string;
  colorRGB: string;
}> = {
  health: {
    icon: '💪',
    label: 'Health',
    colorRGB: '59, 130, 246' // Blue
  },
  growth: {
    icon: '🌱',
    label: 'Growth',
    colorRGB: '16, 185, 129' // Emerald
  },
  lifestyle: {
    icon: '⭐️',
    label: 'Lifestyle',
    colorRGB: '139, 92, 246' // Purple
  },
  custom: {
    icon: '✨',
    label: 'Custom',
    colorRGB: '236, 72, 153' // Pink
  }
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_HABITS: Habit[] = [
  {
    id: 'habit_1',
    name: 'Morning Meditation',
    category: 'health',
    streak: 5,
    completedDays: [
      '2024-01-15',
      '2024-01-16',
      '2024-01-17'
    ]
  },
  {
    id: 'habit_2',
    name: 'Read 30 minutes',
    category: 'growth',
    streak: 3,
    completedDays: []
  },
  {
    id: 'habit_3',
    name: 'Sleep by 11pm',
    category: 'lifestyle',
    streak: 2,
    completedDays: []
  }
];

const HabitsWidget = () => {
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [habits] = useState<Habit[]>(MOCK_HABITS);
  const { theme } = useTimeBasedTheme();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showMonthlyView, setShowMonthlyView] = useState(false);

  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  const getCurrentWeekDates = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
    return WEEKDAYS.map((_, index) => addDays(start, index));
  };

  const weekDates = getCurrentWeekDates();

  const isDateCompleted = (habit: Habit, date: Date) => {
    return habit.completedDays.includes(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div 
      className={styles.container}
      style={{
        '--gradient-start': theme.gradientStart,
        '--gradient-middle': theme.gradientMiddle,
        '--gradient-end': theme.gradientEnd,
        '--accent-rgb': theme.accentRGB,
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>✨</span>
          <span className={styles.headerText}>Daily Habits</span>
        </div>

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
              onClick={() => setSelectedCategory(category as HabitCategory)}
              style={{
                '--category-color-rgb': config.colorRGB
              } as React.CSSProperties}
            >
              <span className={styles.categoryIcon}>{config.icon}</span>
              <span className={styles.categoryLabel}>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.habitsList}>
          {filteredHabits.map(habit => (
            <motion.div
              key={habit.id}
              className={styles.habitCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                '--category-color-rgb': CATEGORY_CONFIG[habit.category].colorRGB
              } as React.CSSProperties}
            >
              <div className={styles.habitInfo}>
                <span className={styles.habitIcon}>
                  {CATEGORY_CONFIG[habit.category].icon}
                </span>
                <span className={styles.habitName}>{habit.name}</span>
                <span className={styles.streakBadge}>
                  🔥 {habit.streak}
                </span>
              </div>

              <div className={styles.weekProgress}>
                {weekDates.map((date) => (
                  <div key={date.toString()} className={styles.dayColumn}>
                    <span className={styles.dayLabel}>
                      {format(date, 'EEE')}
                    </span>
                    <div 
                      className={`${styles.dayCheck} ${
                        isDateCompleted(habit, date) ? styles.completed : ''
                      }`}
                    >
                      {format(date, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.habitActions}>
                <button 
                  className={styles.monthlyViewButton}
                  onClick={() => {
                    setSelectedHabit(habit);
                    setShowMonthlyView(true);
                  }}
                  aria-label="View monthly progress"
                >
                  <ChartIcon className={styles.actionIcon} />
                </button>
                <button 
                  className={styles.checkInButton}
                  onClick={() => {/* TODO: Handle check-in */}}
                >
                  Check In
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedHabit && (
        <MonthlyView
          isOpen={showMonthlyView}
          onClose={() => setShowMonthlyView(false)}
          habit={selectedHabit}
        />
      )}
    </div>
  );
};

export default HabitsWidget; 