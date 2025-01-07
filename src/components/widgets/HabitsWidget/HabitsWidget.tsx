import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './HabitsWidget.module.css';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { format, startOfWeek, addDays } from 'date-fns';
import { MonthlyView } from './MonthlyView';
import { ChartIcon, CheckmarkIcon, PlusIcon, DotsHorizontalIcon } from '@/components/common/icons';
import { StatusMenu } from './StatusMenu';
import { HabitStatus, STATUS_CONFIG, HabitCategory, CATEGORY_CONFIG } from './types';
import { HabitForm } from './HabitForm';
import { HabitActionsMenu } from './HabitActionsMenu';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_HABITS: Habit[] = [
  {
    id: 'habit_1',
    name: 'Morning Meditation',
    category: 'health',
    streak: 5,
    completedDays: [
      { date: '2024-01-15', status: 'completed' },
      { date: '2024-01-16', status: 'completed' },
      { date: '2024-01-17', status: 'completed' }
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

// Add this interface for the div element's data attributes
interface DayColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-tooltip'?: string;
}

const HabitsWidget = () => {
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const { theme } = useTimeBasedTheme();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });

  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  const getCurrentWeekDates = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
    return WEEKDAYS.map((_, index) => addDays(start, index));
  };

  const weekDates = getCurrentWeekDates();

  const getDateStatus = (habit: Habit, date: Date): HabitStatus => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completion = habit.completedDays.find(day => day.date === dateStr);
    return completion?.status || null;
  };

  const handleDayClick = (event: React.MouseEvent, date: Date, habit: Habit) => {
    setSelectedDate(date);
    setSelectedHabit(habit);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + 8
    });
    setShowStatusMenu(true);
  };

  const handleStatusSelect = (status: HabitStatus) => {
    if (selectedDate && selectedHabit) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setHabits(prevHabits => 
        prevHabits.map(habit => {
          if (habit.id === selectedHabit.id) {
            const existingIndex = habit.completedDays.findIndex(day => day.date === dateStr);
            const updatedDays = [...habit.completedDays];
            
            if (existingIndex >= 0) {
              // Update existing status
              updatedDays[existingIndex] = { date: dateStr, status };
            } else {
              // Add new status
              updatedDays.push({ date: dateStr, status });
            }
            
            return {
              ...habit,
              completedDays: updatedDays
            };
          }
          return habit;
        })
      );
    }
  };

  const handleCreateHabit = (habitData: { name: string; category: HabitCategory }) => {
    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      ...habitData,
      streak: 0,
      completedDays: []
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const handleEditHabit = (habitData: { name: string; category: HabitCategory }) => {
    if (!editingHabit) return;
    
    setHabits(prev => prev.map(habit => 
      habit.id === editingHabit.id 
        ? { ...habit, ...habitData }
        : habit
    ));
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
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
          <span className={styles.headerIcon}>✅</span>
          <span className={styles.headerText}>Daily Habits</span>
          <button 
            className={styles.addButton}
            onClick={() => setShowHabitForm(true)}
            aria-label="Add new habit"
          >
            <PlusIcon className={styles.actionIcon} />
          </button>
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
                  <div 
                    key={date.toString()} 
                    className={styles.dayColumn} 
                    data-tooltip="Click to set status"
                    role="button"
                    aria-label={`Set status for ${format(date, 'EEEE')}`}
                  >
                    <span className={styles.dayLabel}>
                      {format(date, 'EEE')}
                    </span>
                    <div 
                      className={`${styles.dayCheck} ${
                        getDateStatus(habit, date) ? styles.hasStatus : ''
                      }`}
                      onClick={(e) => handleDayClick(e, date, habit)}
                      data-status={getDateStatus(habit, date)}
                      data-day={format(date, 'd')}
                    >
                      {(() => {
                        const status = getDateStatus(habit, date);
                        if (!status) return format(date, 'd');
                        
                        if (status === 'completed') {
                          return <CheckmarkIcon className={styles.checkmarkIcon} />;
                        }
                        
                        if (['partial', 'rescheduled', 'half'].includes(status)) {
                          return format(date, 'd');
                        }
                        
                        return <span className={styles.statusIcon}>{STATUS_CONFIG[status].icon}</span>;
                      })()}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.habitActions}>
                <button 
                  className={styles.actionButton}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActionMenuPosition({
                      x: Math.min(rect.left, window.innerWidth - 144), // 144px = menu width
                      y: rect.bottom
                    });
                    setSelectedHabit(habit);
                    setShowActionsMenu(true);
                  }}
                >
                  <DotsHorizontalIcon className={styles.actionIcon} />
                </button>
                <button 
                  className={styles.monthlyViewButton}
                  onClick={() => {
                    setSelectedHabit(habit);
                    setShowMonthlyView(true);
                  }}
                >
                  <ChartIcon className={styles.actionIcon} />
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

      {showStatusMenu && (
        <StatusMenu
          isOpen={showStatusMenu}
          onClose={() => setShowStatusMenu(false)}
          onSelect={handleStatusSelect}
          position={menuPosition}
        />
      )}

      {showHabitForm && (
        <HabitForm
          isOpen={showHabitForm}
          onClose={() => {
            setShowHabitForm(false);
            setEditingHabit(null);
          }}
          onSubmit={editingHabit ? handleEditHabit : handleCreateHabit}
          initialValues={editingHabit ?? undefined}
          mode={editingHabit ? 'edit' : 'create'}
        />
      )}

      {showActionsMenu && selectedHabit && (
        <HabitActionsMenu
          isOpen={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          onEdit={() => {
            setEditingHabit(selectedHabit);
            setShowHabitForm(true);
          }}
          onDelete={() => handleDeleteHabit(selectedHabit.id)}
          position={actionMenuPosition}
        />
      )}
    </div>
  );
};

export default HabitsWidget; 