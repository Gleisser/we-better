import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './HabitsWidget.module.css';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { useDashboardTranslation } from '@/shared/hooks/useTranslation';
import { format, addDays } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
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
import { useHabitLogsMap, useHabits } from '@/shared/hooks/useHabits';
import type { QueryBehaviorOptions } from '@/shared/hooks/utils/queryBehavior';
import {
  Habit as ApiHabit,
  HabitLog,
  HabitStatus as ApiHabitStatus,
} from '@/core/services/habitsService';
import { HabitForm } from './HabitForm';
import { HabitActionsMenu } from './HabitActionsMenu';

const DASHBOARD_HABITS_QUERY_OPTIONS: QueryBehaviorOptions = {
  staleTime: 1000 * 60 * 2,
  gcTime: 1000 * 60 * 15,
  refetchOnWindowFocus: false,
  retry: 1,
};

const DASHBOARD_HABIT_LOGS_QUERY_OPTIONS: QueryBehaviorOptions = {
  staleTime: 1000 * 60,
  gcTime: 1000 * 60 * 10,
  refetchOnWindowFocus: false,
  retry: 1,
};

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
  const { t, currentLanguage } = useDashboardTranslation();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const { theme } = useTimeBasedTheme();

  // Get the appropriate locale for date formatting
  const dateLocale = currentLanguage === 'pt' ? ptBR : enUS;
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
  const selectedApiCategory = selectedCategory === 'all' ? undefined : selectedCategory;
  const habitLogDateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = addDays(endDate, -30);

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  }, []);

  // Use the habits hook for API integration
  const {
    habits: apiHabits,
    isLoading,
    error,
    createHabit: apiCreateHabit,
    updateHabit: apiUpdateHabit,
    archiveHabit: apiArchiveHabit,
    logHabitCompletion,
  } = useHabits({
    category: selectedApiCategory,
    queryOptions: DASHBOARD_HABITS_QUERY_OPTIONS,
  });
  const { logsByHabit, refetchHabitLogs } = useHabitLogsMap(
    apiHabits.map(habit => habit.id),
    habitLogDateRange.startDate,
    habitLogDateRange.endDate,
    DASHBOARD_HABIT_LOGS_QUERY_OPTIONS
  );

  // Transform API habits to local format
  const habits: LocalHabit[] = apiHabits.map(apiHabit =>
    transformApiHabit(apiHabit, logsByHabit[apiHabit.id] || [])
  );

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setCollapsedHabits(new Set(habits.map(habit => habit.id)));
      setIsCollapsed(true);
    }
  }, [habits]);

  const filteredHabits =
    selectedCategory === 'all'
      ? habits
      : habits.filter(habit => habit.category === selectedCategory);

  const getCurrentWeekDates = (): Date[] => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
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

      // Call the API
      try {
        await logHabitCompletion(selectedHabit.id, dateStr, apiStatus, undefined);
      } catch (error) {
        console.error('Failed to log habit status:', error);
        void refetchHabitLogs(selectedHabit.id);
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
                        t('widgets.habits.setStatusFor', {
                          day: format(date, 'EEEE', { locale: dateLocale }),
                        }) as string
                      }
                    >
                      <span className={styles.dayLabel}>
                        {currentLanguage === 'pt'
                          ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][
                              date.getDay() === 0 ? 6 : date.getDay() - 1
                            ]
                          : format(date, 'EEE', { locale: dateLocale })}
                      </span>
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
