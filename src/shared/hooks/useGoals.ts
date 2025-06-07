/**
 * Custom hook for goals management
 * Follows the same patterns as useHabits for consistency
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Goal,
  GoalWithMilestones,
  Milestone,
  UserReviewSettings,
  GoalStats,
  GoalCategory,
  ReviewFrequency,
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  fetchGoalById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  fetchReviewSettings,
  upsertReviewSettings,
  updateReviewSettings,
  completeReview,
  fetchGoalStats,
  increaseProgress,
  decreaseProgress,
  toggleMilestoneCompletion,
} from '@/core/services/goalsService';

// Hook return type
export interface UseGoalsReturn {
  // State
  goals: GoalWithMilestones[];
  reviewSettings: UserReviewSettings | null;
  stats: GoalStats | null;
  isLoading: boolean;
  error: Error | null;

  // Goal operations
  fetchGoals: (category?: GoalCategory, includeMilestones?: boolean) => Promise<void>;
  createGoal: (title: string, category: GoalCategory, targetDate?: string) => Promise<Goal>;
  updateGoal: (
    goalId: string,
    updates: {
      title?: string;
      category?: GoalCategory;
      progress?: number;
      target_date?: string;
    }
  ) => Promise<Goal>;
  deleteGoal: (goalId: string) => Promise<void>;
  refreshGoal: (goalId: string) => Promise<void>;

  // Progress operations
  increaseGoalProgress: (goalId: string, increment?: number) => Promise<void>;
  decreaseGoalProgress: (goalId: string, decrement?: number) => Promise<void>;

  // Milestone operations
  addMilestone: (goalId: string, title: string) => Promise<Milestone>;
  updateMilestone: (
    goalId: string,
    milestoneId: string,
    updates: { title?: string; completed?: boolean }
  ) => Promise<Milestone>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string, completed: boolean) => Promise<void>;

  // Review settings operations
  fetchReviewSettings: () => Promise<void>;
  saveReviewSettings: (settings: {
    frequency: ReviewFrequency;
    notification_preferences: Record<string, boolean>;
    next_review_date?: string;
    reminder_days?: number;
  }) => Promise<UserReviewSettings>;
  updateReviewSettings: (settings: {
    frequency?: ReviewFrequency;
    notification_preferences?: Record<string, boolean>;
    next_review_date?: string;
    reminder_days?: number;
  }) => Promise<UserReviewSettings>;
  completeReview: () => Promise<UserReviewSettings>;

  // Statistics
  fetchStats: () => Promise<void>;

  // Utility
  clearError: () => void;
  refetch: () => Promise<void>;
}

export const useGoals = (): UseGoalsReturn => {
  // State
  const [goals, setGoals] = useState<GoalWithMilestones[]>([]);
  const [reviewSettings, setReviewSettings] = useState<UserReviewSettings | null>(null);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to handle errors
  const handleError = useCallback((error: unknown) => {
    const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
    setError(errorObj);
    console.error('Goals hook error:', errorObj);
  }, []);

  // Helper function to find and update a goal in state
  const updateGoalInState = useCallback(
    (goalId: string, updater: (goal: GoalWithMilestones) => GoalWithMilestones) => {
      setGoals(prevGoals => prevGoals.map(goal => (goal.id === goalId ? updater(goal) : goal)));
    },
    []
  );

  // Fetch goals
  const fetchGoalsData = useCallback(
    async (category?: GoalCategory, includeMilestones = true) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchGoals(category, includeMilestones);

        if (!response) {
          setGoals([]);
          return;
        }

        // Transform goals to include empty milestones array if not included
        const goalsWithMilestones: GoalWithMilestones[] = response.goals.map(goal => ({
          ...goal,
          milestones: 'milestones' in goal ? goal.milestones : [],
        }));

        setGoals(goalsWithMilestones);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  // Create goal
  const createGoalData = useCallback(
    async (title: string, category: GoalCategory, targetDate?: string): Promise<Goal> => {
      try {
        setError(null);
        const newGoal = await createGoal(title, category, 0, targetDate);

        if (!newGoal) {
          throw new Error('Failed to create goal');
        }

        // Optimistically add to state with empty milestones
        const goalWithMilestones: GoalWithMilestones = {
          ...newGoal,
          milestones: [],
        };
        setGoals(prevGoals => [goalWithMilestones, ...prevGoals]);

        return newGoal;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  // Update goal
  const updateGoalData = useCallback(
    async (
      goalId: string,
      updates: {
        title?: string;
        category?: GoalCategory;
        progress?: number;
        target_date?: string;
      }
    ): Promise<Goal> => {
      try {
        setError(null);

        // Optimistic update
        updateGoalInState(goalId, goal => ({ ...goal, ...updates }));

        const updatedGoal = await updateGoal(goalId, updates);

        if (!updatedGoal) {
          throw new Error('Failed to update goal');
        }

        // Update with server response
        updateGoalInState(goalId, goal => ({ ...goal, ...updatedGoal }));

        return updatedGoal;
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await fetchGoalsData();
        throw err;
      }
    },
    [handleError, fetchGoalsData, updateGoalInState]
  );

  // Delete goal
  const deleteGoalData = useCallback(
    async (goalId: string): Promise<void> => {
      try {
        setError(null);

        // Optimistic removal
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));

        await deleteGoal(goalId);
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await fetchGoalsData();
        throw err;
      }
    },
    [handleError, fetchGoalsData]
  );

  // Refresh a specific goal
  const refreshGoal = useCallback(
    async (goalId: string): Promise<void> => {
      try {
        setError(null);
        const refreshedGoal = (await fetchGoalById(goalId, true)) as GoalWithMilestones;
        updateGoalInState(goalId, () => refreshedGoal);
      } catch (err) {
        handleError(err);
      }
    },
    [handleError, updateGoalInState]
  );

  // Increase goal progress
  const increaseGoalProgress = useCallback(
    async (goalId: string, increment = 5): Promise<void> => {
      try {
        setError(null);

        // Optimistic update
        updateGoalInState(goalId, goal => ({
          ...goal,
          progress: Math.min(100, goal.progress + increment),
        }));

        await increaseProgress(goalId, increment);
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await refreshGoal(goalId);
        throw err;
      }
    },
    [handleError, refreshGoal, updateGoalInState]
  );

  // Decrease goal progress
  const decreaseGoalProgress = useCallback(
    async (goalId: string, decrement = 5): Promise<void> => {
      try {
        setError(null);

        // Optimistic update
        updateGoalInState(goalId, goal => ({
          ...goal,
          progress: Math.max(0, goal.progress - decrement),
        }));

        await decreaseProgress(goalId, decrement);
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await refreshGoal(goalId);
        throw err;
      }
    },
    [handleError, refreshGoal, updateGoalInState]
  );

  // Add milestone
  const addMilestone = useCallback(
    async (goalId: string, title: string): Promise<Milestone> => {
      try {
        setError(null);
        const newMilestone = await createMilestone(goalId, title);

        if (!newMilestone) {
          throw new Error('Failed to create milestone');
        }

        // Update goal state with new milestone
        updateGoalInState(goalId, goal => ({
          ...goal,
          milestones: [...goal.milestones, newMilestone],
        }));

        return newMilestone;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError, updateGoalInState]
  );

  // Update milestone
  const updateMilestoneData = useCallback(
    async (
      goalId: string,
      milestoneId: string,
      updates: { title?: string; completed?: boolean }
    ): Promise<Milestone> => {
      try {
        setError(null);

        // Optimistic update
        updateGoalInState(goalId, goal => ({
          ...goal,
          milestones: goal.milestones.map(milestone =>
            milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
          ),
        }));

        const updatedMilestone = await updateMilestone(goalId, milestoneId, updates);

        if (!updatedMilestone) {
          throw new Error('Failed to update milestone');
        }

        // Update with server response
        updateGoalInState(goalId, goal => ({
          ...goal,
          milestones: goal.milestones.map(milestone =>
            milestone.id === milestoneId ? updatedMilestone : milestone
          ),
        }));

        return updatedMilestone;
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await refreshGoal(goalId);
        throw err;
      }
    },
    [handleError, refreshGoal, updateGoalInState]
  );

  // Delete milestone
  const deleteMilestoneData = useCallback(
    async (goalId: string, milestoneId: string): Promise<void> => {
      try {
        setError(null);

        // Optimistic removal
        updateGoalInState(goalId, goal => ({
          ...goal,
          milestones: goal.milestones.filter(milestone => milestone.id !== milestoneId),
        }));

        await deleteMilestone(goalId, milestoneId);
      } catch (err) {
        handleError(err);
        // Revert optimistic update on error
        await refreshGoal(goalId);
        throw err;
      }
    },
    [handleError, refreshGoal, updateGoalInState]
  );

  // Toggle milestone
  const toggleMilestone = useCallback(
    async (goalId: string, milestoneId: string, completed: boolean): Promise<void> => {
      try {
        setError(null);
        await toggleMilestoneCompletion(goalId, milestoneId, completed);
        await updateMilestoneData(goalId, milestoneId, { completed });
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError, updateMilestoneData]
  );

  // Fetch review settings
  const fetchReviewSettingsData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const settings = await fetchReviewSettings();
      setReviewSettings(settings);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Save review settings
  const saveReviewSettings = useCallback(
    async (settings: {
      frequency: ReviewFrequency;
      notification_preferences: Record<string, boolean>;
      next_review_date?: string;
      reminder_days?: number;
    }): Promise<UserReviewSettings> => {
      try {
        setError(null);
        const savedSettings = await upsertReviewSettings(settings);
        if (!savedSettings) {
          throw new Error('Failed to save review settings');
        }
        setReviewSettings(savedSettings);
        return savedSettings;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  // Update review settings
  const updateReviewSettingsData = useCallback(
    async (settings: {
      frequency?: ReviewFrequency;
      notification_preferences?: Record<string, boolean>;
      next_review_date?: string;
      reminder_days?: number;
    }): Promise<UserReviewSettings> => {
      try {
        setError(null);
        const updatedSettings = await updateReviewSettings(settings);
        if (!updatedSettings) {
          throw new Error('Failed to update review settings');
        }
        setReviewSettings(updatedSettings);
        return updatedSettings;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError]
  );

  // Complete review
  const completeReviewData = useCallback(async (): Promise<UserReviewSettings> => {
    try {
      setError(null);
      const completedReview = await completeReview();
      if (!completedReview) {
        throw new Error('Failed to complete review');
      }
      setReviewSettings(completedReview);
      return completedReview;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  // Fetch statistics
  const fetchStatsData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const statsData = await fetchGoalStats();
      setStats(statsData);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refetch all data
  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchGoalsData(undefined, true),
      fetchReviewSettingsData(),
      fetchStatsData(),
    ]);
  }, [fetchGoalsData, fetchReviewSettingsData, fetchStatsData]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchGoalsData(undefined, true);
  }, [fetchGoalsData]);

  return {
    // State
    goals,
    reviewSettings,
    stats,
    isLoading,
    error,

    // Goal operations
    fetchGoals: fetchGoalsData,
    createGoal: createGoalData,
    updateGoal: updateGoalData,
    deleteGoal: deleteGoalData,
    refreshGoal,

    // Progress operations
    increaseGoalProgress,
    decreaseGoalProgress,

    // Milestone operations
    addMilestone,
    updateMilestone: updateMilestoneData,
    deleteMilestone: deleteMilestoneData,
    toggleMilestone,

    // Review settings operations
    fetchReviewSettings: fetchReviewSettingsData,
    saveReviewSettings,
    updateReviewSettings: updateReviewSettingsData,
    completeReview: completeReviewData,

    // Statistics
    fetchStats: fetchStatsData,

    // Utility
    clearError,
    refetch,
  };
};
