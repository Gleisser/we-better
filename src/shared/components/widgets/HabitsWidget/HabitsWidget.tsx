import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './HabitsWidget.module.css';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { format, startOfWeek, addDays } from 'date-fns';
import { MonthlyView } from './MonthlyView';
import {
  ChartIcon,
  CheckmarkIcon,
  PlusIcon,
  DotsHorizontalIcon,
  ChevronDownIcon,
} from '@/shared/components/common/icons';
import { StatusMenu } from './StatusMenu';
import { HabitStatus, Habit as LocalHabit, HabitCategory } from './types';
import { STATUS_CONFIG, CATEGORY_CONFIG } from './config';
import { useHabits } from '@/shared/hooks/useHabits';
import {
  Habit as ApiHabit,
  HabitLog,
  HabitStatus as ApiHabitStatus,
} from '@/core/services/habitsService';
import { HabitForm } from './HabitForm';
import { HabitActionsMenu } from './HabitActionsMenu';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Helper function to transform API Habit to local Habit format
const transformApiHabit = (apiHabit: ApiHabit, logs: HabitLog[] = []): LocalHabit => {
  return {
    id: apiHabit.id,
    name: apiHabit.name,
    category: apiHabit.category as HabitCategory,
    streak: apiHabit.streak,
    completedDays: logs.map(log => ({
      date: log.date,
      status: log.status as HabitStatus,
    })),
    createdAt: apiHabit.created_at,
    updatedAt: apiHabit.updated_at,
  };
};

const HabitsWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const { theme } = useTimeBasedTheme();
  const [selectedHabit, setSelectedHabit] = useState<LocalHabit | null>(null);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<LocalHabit | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [collapsedHabits, setCollapsedHabits] = useState<Set<string>>(new Set());
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog[]>>({});

  // Use the habits hook for API integration
  const {
    habits: apiHabits,
    isLoading,
    error,
    fetchHabits,
    createHabit: apiCreateHabit,
    updateHabit: apiUpdateHabit,
    archiveHabit: apiArchiveHabit,
    logHabitCompletion,
    getHabitLogs,
  } = useHabits();

  // Fetch logs for each habit
  const fetchLogsForHabit = useCallback(
    async (habitId: string) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Get logs for last 30 days

        const logsResponse = await getHabitLogs(
          habitId,
          format(startDate, 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd')
        );

        if (logsResponse) {
          setHabitLogs(prev => ({
            ...prev,
            [habitId]: logsResponse.logs,
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch logs for habit ${habitId}:`, err);
      }
    },
    [getHabitLogs]
  );

  // Transform API habits to local format
  const habits: LocalHabit[] = apiHabits.map(apiHabit =>
    transformApiHabit(apiHabit, habitLogs[apiHabit.id] || [])
  );

  // Fetch logs for all habits when habits change
  useEffect(() => {
    const fetchAllLogs = async (): Promise<void> => {
      for (const habit of apiHabits) {
        await fetchLogsForHabit(habit.id);
      }
    };

    if (apiHabits.length > 0) {
      fetchAllLogs();
    }
  }, [apiHabits, fetchLogsForHabit]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setCollapsedHabits(new Set(habits.map(habit => habit.id)));
      setIsCollapsed(true);
    }
  }, [habits]);

  // Initialize based on selected category
  useEffect(() => {
    fetchHabits(selectedCategory === 'all' ? undefined : selectedCategory);
  }, [fetchHabits, selectedCategory]);

  const filteredHabits =
    selectedCategory === 'all'
      ? habits
      : habits.filter(habit => habit.category === selectedCategory);

  const getCurrentWeekDates = (): Date[] => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
    return WEEKDAYS.map((_, index) => addDays(start, index));
  };

  const weekDates = getCurrentWeekDates();

  const getDateStatus = (habit: LocalHabit, date: Date): HabitStatus => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completion = habit.completedDays.find(day => day.date === dateStr);
    return completion?.status || null;
  };

  const handleDayClick = (event: React.MouseEvent, date: Date, habit: LocalHabit): void => {
    setSelectedDate(date);
    setSelectedHabit(habit);

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // On mobile, center the menu horizontally and position it below the clicked element
      setMenuPosition({
        x: Math.max(10, Math.min(window.innerWidth - 200, window.innerWidth / 2 - 100)), // 200px assumed menu width
        y: rect.bottom + window.scrollY + 8,
      });
    } else {
      // On desktop, keep current behavior
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + 8,
      });
    }
    setShowStatusMenu(true);
  };

  const handleStatusSelect = async (status: HabitStatus): Promise<void> => {
    if (selectedDate && selectedHabit) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const apiStatus: ApiHabitStatus = status === null ? 'missed' : status;

      // Optimistic UI update
      setHabitLogs(prevLogs => {
        const habitId = selectedHabit.id;
        const currentLogs = [...(prevLogs[habitId] || [])];
        const existingLogIndex = currentLogs.findIndex(log => log.date === dateStr);

        if (existingLogIndex >= 0) {
          currentLogs[existingLogIndex] = {
            ...currentLogs[existingLogIndex],
            status: apiStatus,
            updated_at: new Date().toISOString(),
          };
        } else {
          currentLogs.push({
            id: `temp_${Date.now()}`,
            habit_id: habitId,
            user_id: '', // Will be set by the server
            date: dateStr,
            status: apiStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        return {
          ...prevLogs,
          [habitId]: currentLogs,
        };
      });

      // Call the API
      try {
        await logHabitCompletion(selectedHabit.id, dateStr, apiStatus, undefined);
        // The habit will be updated automatically by the useHabits hook
        // after successful log submission
      } catch (error) {
        console.error('Failed to log habit status:', error);
        // Revert the optimistic update on error
        fetchLogsForHabit(selectedHabit.id);
      }
    }
  };

  const handleCreateHabit = async (habitData: {
    name: string;
    category: HabitCategory;
  }): Promise<void> => {
    try {
      await apiCreateHabit(
        habitData.name,
        habitData.category,
        new Date().toISOString().split('T')[0] // Use today as start date
      );
      // The newly created habit will be included in the next fetchHabits call
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleEditHabit = async (habitData: {
    name: string;
    category: HabitCategory;
  }): Promise<void> => {
    if (!editingHabit) return;

    try {
      await apiUpdateHabit(editingHabit.id, {
        name: habitData.name,
        category: habitData.category,
      });
      setEditingHabit(null);
    } catch (error) {
      console.error('Failed to update habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string): Promise<void> => {
    try {
      await apiArchiveHabit(habitId);
      // The habit will be removed from state by the useHabits hook
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const toggleHabit = (habitId: string): void => {
    setCollapsedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  return (
    <div
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      style={
        {
          '--gradient-start': theme.gradientStart,
          '--gradient-middle': theme.gradientMiddle,
          '--gradient-end': theme.gradientEnd,
          '--accent-rgb': theme.accentRGB,
        } as React.CSSProperties
      }
    >
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>✅</span>
            <span className={styles.headerText}>{t('widgets.habits.title')}</span>
            <button
              className={styles.addButton}
              onClick={() => setShowHabitForm(true)}
              aria-label={t('widgets.habits.addNew') as string}
            >
              <PlusIcon className={styles.actionIcon} />
            </button>
          </div>

          <button
            className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              (isCollapsed
                ? t('widgets.habits.expandWidget')
                : t('widgets.habits.collapseWidget')) as string
            }
          >
            <ChevronDownIcon className={styles.collapseIcon} />
          </button>
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
            {t('widgets.habits.categories.all')}
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
            <button
              key={category}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.selected : ''
              }`}
              onClick={() => setSelectedCategory(category as HabitCategory)}
              style={
                {
                  '--category-color-rgb': config.colorRGB,
                } as React.CSSProperties
              }
            >
              <span className={styles.categoryIcon}>{config.icon}</span>
              <span className={styles.categoryLabel}>
                {t(`widgets.habits.categories.${category}`)}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {isLoading && (
            <div className={styles.loadingIndicator}>{t('widgets.habits.loading')}</div>
          )}
          {error && (
            <div className={styles.errorMessage}>
              {t('widgets.habits.errorLoading')}: {error.message}
            </div>
          )}

          {!isLoading && !error && filteredHabits.length === 0 && (
            <div className={styles.emptyState}>
              <p>{t('widgets.habits.emptyState')}</p>
              <button className={styles.createButton} onClick={() => setShowHabitForm(true)}>
                {t('widgets.habits.createHabit')}
              </button>
            </div>
          )}

          <div className={styles.habitsList}>
            {filteredHabits.map(habit => (
              <motion.div
                key={habit.id}
                className={`${styles.habitCard} ${collapsedHabits.has(habit.id) ? styles.collapsed : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={
                  {
                    '--category-color-rgb':
                      CATEGORY_CONFIG[habit.category as keyof typeof CATEGORY_CONFIG].colorRGB,
                  } as React.CSSProperties
                }
              >
                <div className={styles.habitHeader}>
                  <div className={styles.habitMainInfo}>
                    <span className={styles.habitIcon}>{CATEGORY_CONFIG[habit.category].icon}</span>
                    <span className={styles.habitName}>{habit.name}</span>
                    <span className={styles.streakBadge}>🔥 {habit.streak}</span>
                  </div>
                  <button
                    className={styles.toggleButton}
                    onClick={() => toggleHabit(habit.id)}
                    aria-label={
                      (collapsedHabits.has(habit.id)
                        ? t('widgets.habits.expandHabit')
                        : t('widgets.habits.collapseHabit')) as string
                    }
                  >
                    <ChevronDownIcon className={styles.toggleIcon} />
                  </button>
                </div>

                <div className={styles.weekProgress}>
                  {weekDates.map(date => (
                    <div
                      key={date.toString()}
                      className={styles.dayColumn}
                      data-tooltip={t('widgets.habits.setStatusTooltip')}
                      role="button"
                      aria-label={
                        t('widgets.habits.setStatusFor', { day: format(date, 'EEEE') }) as string
                      }
                    >
                      <span className={styles.dayLabel}>{format(date, 'EEE')}</span>
                      <div
                        className={`${styles.dayCheck} ${
                          getDateStatus(habit, date) ? styles.hasStatus : ''
                        }`}
                        onClick={e => handleDayClick(e, date, habit)}
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

                          return (
                            <span className={styles.statusIcon}>{STATUS_CONFIG[status].icon}</span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.habitActions}>
                  <button
                    className={styles.actionButton}
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActionMenuPosition({
                        x: Math.min(rect.left, window.innerWidth - 144), // 144px = menu width
                        y: rect.bottom,
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
      </motion.div>

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
