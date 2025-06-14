import { Habit, calculateStreak } from './types';

export const updateHabitStreak = (habit: Habit): Habit => {
  const streak = calculateStreak(habit.completedDays);
  return { ...habit, streak };
};

export const updateAllHabitStreaks = (habits: Habit[]): Habit[] => {
  return habits.map(updateHabitStreak);
};

export const cleanupOldData = (habits: Habit[]): Habit[] => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return habits.map(habit => ({
    ...habit,
    completedDays: habit.completedDays.filter(day => 
      new Date(day.date) >= thirtyDaysAgo
    )
  }));
}; 