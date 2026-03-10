import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  Goal,
  GoalWithMilestones,
  Milestone,
  UserReviewSettings,
  GoalStats,
  GoalCategory,
  ReviewFrequency,
  fetchGoals as fetchGoalsApi,
  createGoal as createGoalApi,
  updateGoal as updateGoalApi,
  deleteGoal as deleteGoalApi,
  fetchGoalById,
  createMilestone as createMilestoneApi,
  updateMilestone as updateMilestoneApi,
  deleteMilestone as deleteMilestoneApi,
  fetchReviewSettings as fetchReviewSettingsApi,
  upsertReviewSettings,
  updateReviewSettings as updateReviewSettingsApi,
  completeReview as completeReviewApi,
  fetchGoalStats as fetchGoalStatsApi,
  increaseProgress,
  decreaseProgress,
  toggleMilestoneCompletion,
} from '@/core/services/goalsService';
import { useAuth } from '@/shared/hooks/useAuth';

export interface UseGoalsOptions {
  category?: GoalCategory;
  includeMilestones?: boolean;
}

export interface UseGoalsReturn {
  goals: GoalWithMilestones[];
  reviewSettings: UserReviewSettings | null;
  stats: GoalStats | null;
  isLoading: boolean;
  error: Error | null;
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
  increaseGoalProgress: (goalId: string, increment?: number) => Promise<void>;
  decreaseGoalProgress: (goalId: string, decrement?: number) => Promise<void>;
  addMilestone: (goalId: string, title: string) => Promise<Milestone>;
  updateMilestone: (
    goalId: string,
    milestoneId: string,
    updates: { title?: string; completed?: boolean }
  ) => Promise<Milestone>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string, completed: boolean) => Promise<void>;
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
  fetchStats: () => Promise<void>;
  clearError: () => void;
  refetch: () => Promise<void>;
}

const goalsQueryKeyPrefix = (userId: string | null) => ['goals', userId ?? 'anonymous'] as const;

const goalsQueryKey = (userId: string | null, category?: GoalCategory, includeMilestones = true) =>
  [
    ...goalsQueryKeyPrefix(userId),
    'list',
    category ?? 'all',
    includeMilestones ? 'full' : 'base',
  ] as const;

const goalReviewSettingsQueryKey = (userId: string | null) =>
  [...goalsQueryKeyPrefix(userId), 'reviewSettings'] as const;

const goalStatsQueryKey = (userId: string | null) =>
  [...goalsQueryKeyPrefix(userId), 'stats'] as const;

const loadGoals = async (
  category?: GoalCategory,
  includeMilestones = true
): Promise<GoalWithMilestones[]> => {
  const response = await fetchGoalsApi(category, includeMilestones);

  if (!response) {
    return [];
  }

  return response.goals.map(goal => ({
    ...goal,
    milestones: 'milestones' in goal ? goal.milestones : [],
  }));
};

const updateGoalAcrossCaches = (
  goals: GoalWithMilestones[] | undefined,
  goalId: string,
  updater: (goal: GoalWithMilestones) => GoalWithMilestones
): GoalWithMilestones[] | undefined => {
  if (!goals) {
    return goals;
  }

  return goals.map(goal => (goal.id === goalId ? updater(goal) : goal));
};

export const useGoals = (options: UseGoalsOptions = {}): UseGoalsReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const category = options.category;
  const includeMilestones = options.includeMilestones ?? true;
  const [manualError, setManualError] = useState<Error | null>(null);

  const goalsQuery = useQuery({
    queryKey: goalsQueryKey(userId, category, includeMilestones),
    queryFn: async () => loadGoals(category, includeMilestones),
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  const reviewSettingsQuery = useQuery({
    queryKey: goalReviewSettingsQueryKey(userId),
    queryFn: async () => fetchReviewSettingsApi(),
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  const statsQuery = useQuery({
    queryKey: goalStatsQueryKey(userId),
    queryFn: async () => fetchGoalStatsApi(),
    enabled: false,
    meta: AUTH_SCOPED_QUERY_META,
  });

  const createGoalMutation = useMutation({
    mutationFn: async ({
      title,
      goalCategory,
      targetDate,
    }: {
      title: string;
      goalCategory: GoalCategory;
      targetDate?: string;
    }) => {
      const goal = await createGoalApi(title, goalCategory, 0, targetDate);

      if (!goal) {
        throw new Error('Failed to create goal');
      }

      return goal;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: goalsQueryKeyPrefix(userId) });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({
      goalId,
      updates,
    }: {
      goalId: string;
      updates: {
        title?: string;
        category?: GoalCategory;
        progress?: number;
        target_date?: string;
      };
    }) => {
      const goal = await updateGoalApi(goalId, updates);

      if (!goal) {
        throw new Error('Failed to update goal');
      }

      return goal;
    },
    onSuccess: updatedGoal => {
      queryClient.setQueriesData<GoalWithMilestones[]>(
        { queryKey: goalsQueryKeyPrefix(userId) },
        goals =>
          updateGoalAcrossCaches(goals, updatedGoal.id, goal => ({
            ...goal,
            ...updatedGoal,
          }))
      );
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const success = await deleteGoalApi(goalId);

      if (!success) {
        throw new Error('Failed to delete goal');
      }

      return goalId;
    },
    onSuccess: goalId => {
      queryClient.setQueriesData<GoalWithMilestones[]>(
        { queryKey: goalsQueryKeyPrefix(userId) },
        goals => goals?.filter(goal => goal.id !== goalId) ?? []
      );
    },
  });

  const refreshGoal = useCallback(
    async (goalId: string): Promise<void> => {
      try {
        const refreshedGoal = (await fetchGoalById(goalId, true)) as GoalWithMilestones | null;

        if (!refreshedGoal) {
          throw new Error('Failed to refresh goal');
        }

        queryClient.setQueriesData<GoalWithMilestones[]>(
          { queryKey: goalsQueryKeyPrefix(userId) },
          goals =>
            updateGoalAcrossCaches(goals, goalId, existingGoal => ({
              ...existingGoal,
              ...refreshedGoal,
              milestones: refreshedGoal.milestones ?? existingGoal.milestones,
            }))
        );
        setManualError(null);
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to refresh goal'));
      }
    },
    [queryClient, userId]
  );

  const addMilestoneMutation = useMutation({
    mutationFn: async ({ goalId, title }: { goalId: string; title: string }) => {
      const milestone = await createMilestoneApi(goalId, title);

      if (!milestone) {
        throw new Error('Failed to create milestone');
      }

      return { goalId, milestone };
    },
    onSuccess: ({ goalId, milestone }) => {
      queryClient.setQueriesData<GoalWithMilestones[]>(
        { queryKey: goalsQueryKeyPrefix(userId) },
        goals =>
          updateGoalAcrossCaches(goals, goalId, goal => ({
            ...goal,
            milestones: [...goal.milestones, milestone],
          }))
      );
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({
      goalId,
      milestoneId,
      updates,
    }: {
      goalId: string;
      milestoneId: string;
      updates: { title?: string; completed?: boolean };
    }) => {
      const milestone = await updateMilestoneApi(goalId, milestoneId, updates);

      if (!milestone) {
        throw new Error('Failed to update milestone');
      }

      return { goalId, milestone };
    },
    onSuccess: ({ goalId, milestone }) => {
      queryClient.setQueriesData<GoalWithMilestones[]>(
        { queryKey: goalsQueryKeyPrefix(userId) },
        goals =>
          updateGoalAcrossCaches(goals, goalId, goal => ({
            ...goal,
            milestones: goal.milestones.map(existingMilestone =>
              existingMilestone.id === milestone.id ? milestone : existingMilestone
            ),
          }))
      );
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) => {
      const success = await deleteMilestoneApi(goalId, milestoneId);

      if (!success) {
        throw new Error('Failed to delete milestone');
      }

      return { goalId, milestoneId };
    },
    onSuccess: ({ goalId, milestoneId }) => {
      queryClient.setQueriesData<GoalWithMilestones[]>(
        { queryKey: goalsQueryKeyPrefix(userId) },
        goals =>
          updateGoalAcrossCaches(goals, goalId, goal => ({
            ...goal,
            milestones: goal.milestones.filter(milestone => milestone.id !== milestoneId),
          }))
      );
    },
  });

  const saveReviewSettingsMutation = useMutation({
    mutationFn: async (settings: {
      frequency: ReviewFrequency;
      notification_preferences: Record<string, boolean>;
      next_review_date?: string;
      reminder_days?: number;
    }) => {
      const reviewSettings = await upsertReviewSettings(settings);

      if (!reviewSettings) {
        throw new Error('Failed to save review settings');
      }

      return reviewSettings;
    },
    onSuccess: reviewSettings => {
      queryClient.setQueryData(goalReviewSettingsQueryKey(userId), reviewSettings);
    },
  });

  const updateReviewSettingsMutation = useMutation({
    mutationFn: async (settings: {
      frequency?: ReviewFrequency;
      notification_preferences?: Record<string, boolean>;
      next_review_date?: string;
      reminder_days?: number;
    }) => {
      const reviewSettings = await updateReviewSettingsApi(settings);

      if (!reviewSettings) {
        throw new Error('Failed to update review settings');
      }

      return reviewSettings;
    },
    onSuccess: reviewSettings => {
      queryClient.setQueryData(goalReviewSettingsQueryKey(userId), reviewSettings);
    },
  });

  const completeReviewMutation = useMutation({
    mutationFn: async () => {
      const reviewSettings = await completeReviewApi();

      if (!reviewSettings) {
        throw new Error('Failed to complete review');
      }

      return reviewSettings;
    },
    onSuccess: reviewSettings => {
      queryClient.setQueryData(goalReviewSettingsQueryKey(userId), reviewSettings);
    },
  });

  const fetchGoals = useCallback(
    async (nextCategory?: GoalCategory, nextIncludeMilestones = true): Promise<void> => {
      if (!userId) {
        setManualError(new Error('Not authenticated'));
        return;
      }

      try {
        await queryClient.fetchQuery({
          queryKey: goalsQueryKey(userId, nextCategory, nextIncludeMilestones),
          queryFn: async () => loadGoals(nextCategory, nextIncludeMilestones),
          meta: AUTH_SCOPED_QUERY_META,
        });
        setManualError(null);
      } catch (error) {
        setManualError(error instanceof Error ? error : new Error('Failed to fetch goals'));
      }
    },
    [queryClient, userId]
  );

  const createGoal = useCallback(
    async (title: string, goalCategory: GoalCategory, targetDate?: string): Promise<Goal> => {
      try {
        const goal = await createGoalMutation.mutateAsync({ title, goalCategory, targetDate });
        setManualError(null);
        return goal;
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to create goal');
        setManualError(nextError);
        throw nextError;
      }
    },
    [createGoalMutation]
  );

  const updateGoal = useCallback(
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
        const goal = await updateGoalMutation.mutateAsync({ goalId, updates });
        setManualError(null);
        return goal;
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to update goal');
        setManualError(nextError);
        throw nextError;
      }
    },
    [updateGoalMutation]
  );

  const deleteGoal = useCallback(
    async (goalId: string): Promise<void> => {
      try {
        await deleteGoalMutation.mutateAsync(goalId);
        setManualError(null);
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to delete goal');
        setManualError(nextError);
        throw nextError;
      }
    },
    [deleteGoalMutation]
  );

  const increaseGoalProgress = useCallback(
    async (goalId: string, increment = 5): Promise<void> => {
      try {
        const goal = await increaseProgress(goalId, increment);

        if (!goal) {
          throw new Error('Failed to increase goal progress');
        }

        queryClient.setQueriesData<GoalWithMilestones[]>(
          { queryKey: goalsQueryKeyPrefix(userId) },
          goals =>
            updateGoalAcrossCaches(goals, goalId, existingGoal => ({
              ...existingGoal,
              ...goal,
            }))
        );
        setManualError(null);
      } catch (error) {
        const nextError =
          error instanceof Error ? error : new Error('Failed to increase goal progress');
        setManualError(nextError);
        throw nextError;
      }
    },
    [queryClient, userId]
  );

  const decreaseGoalProgress = useCallback(
    async (goalId: string, decrement = 5): Promise<void> => {
      try {
        const goal = await decreaseProgress(goalId, decrement);

        if (!goal) {
          throw new Error('Failed to decrease goal progress');
        }

        queryClient.setQueriesData<GoalWithMilestones[]>(
          { queryKey: goalsQueryKeyPrefix(userId) },
          goals =>
            updateGoalAcrossCaches(goals, goalId, existingGoal => ({
              ...existingGoal,
              ...goal,
            }))
        );
        setManualError(null);
      } catch (error) {
        const nextError =
          error instanceof Error ? error : new Error('Failed to decrease goal progress');
        setManualError(nextError);
        throw nextError;
      }
    },
    [queryClient, userId]
  );

  const addMilestone = useCallback(
    async (goalId: string, title: string): Promise<Milestone> => {
      try {
        const result = await addMilestoneMutation.mutateAsync({ goalId, title });
        setManualError(null);
        return result.milestone;
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to create milestone');
        setManualError(nextError);
        throw nextError;
      }
    },
    [addMilestoneMutation]
  );

  const updateMilestone = useCallback(
    async (
      goalId: string,
      milestoneId: string,
      updates: { title?: string; completed?: boolean }
    ): Promise<Milestone> => {
      try {
        const result = await updateMilestoneMutation.mutateAsync({ goalId, milestoneId, updates });
        setManualError(null);
        return result.milestone;
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to update milestone');
        setManualError(nextError);
        throw nextError;
      }
    },
    [updateMilestoneMutation]
  );

  const deleteMilestone = useCallback(
    async (goalId: string, milestoneId: string): Promise<void> => {
      try {
        await deleteMilestoneMutation.mutateAsync({ goalId, milestoneId });
        setManualError(null);
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to delete milestone');
        setManualError(nextError);
        throw nextError;
      }
    },
    [deleteMilestoneMutation]
  );

  const toggleMilestone = useCallback(
    async (goalId: string, milestoneId: string, completed: boolean): Promise<void> => {
      try {
        const milestone = await toggleMilestoneCompletion(goalId, milestoneId, completed);

        if (!milestone) {
          throw new Error('Failed to update milestone');
        }

        queryClient.setQueriesData<GoalWithMilestones[]>(
          { queryKey: goalsQueryKeyPrefix(userId) },
          goals =>
            updateGoalAcrossCaches(goals, goalId, goal => ({
              ...goal,
              milestones: goal.milestones.map(existingMilestone =>
                existingMilestone.id === milestone.id ? milestone : existingMilestone
              ),
            }))
        );
        setManualError(null);
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Failed to update milestone');
        setManualError(nextError);
        throw nextError;
      }
    },
    [queryClient, userId]
  );

  const fetchReviewSettings = useCallback(async (): Promise<void> => {
    await reviewSettingsQuery.refetch();
  }, [reviewSettingsQuery]);

  const saveReviewSettings = useCallback(
    async (settings: {
      frequency: ReviewFrequency;
      notification_preferences: Record<string, boolean>;
      next_review_date?: string;
      reminder_days?: number;
    }): Promise<UserReviewSettings> => {
      try {
        const reviewSettings = await saveReviewSettingsMutation.mutateAsync(settings);
        setManualError(null);
        return reviewSettings;
      } catch (error) {
        const nextError =
          error instanceof Error ? error : new Error('Failed to save review settings');
        setManualError(nextError);
        throw nextError;
      }
    },
    [saveReviewSettingsMutation]
  );

  const updateReviewSettings = useCallback(
    async (settings: {
      frequency?: ReviewFrequency;
      notification_preferences?: Record<string, boolean>;
      next_review_date?: string;
      reminder_days?: number;
    }): Promise<UserReviewSettings> => {
      try {
        const reviewSettings = await updateReviewSettingsMutation.mutateAsync(settings);
        setManualError(null);
        return reviewSettings;
      } catch (error) {
        const nextError =
          error instanceof Error ? error : new Error('Failed to update review settings');
        setManualError(nextError);
        throw nextError;
      }
    },
    [updateReviewSettingsMutation]
  );

  const completeReview = useCallback(async (): Promise<UserReviewSettings> => {
    try {
      const reviewSettings = await completeReviewMutation.mutateAsync();
      setManualError(null);
      return reviewSettings;
    } catch (error) {
      const nextError = error instanceof Error ? error : new Error('Failed to complete review');
      setManualError(nextError);
      throw nextError;
    }
  }, [completeReviewMutation]);

  const fetchStats = useCallback(async (): Promise<void> => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const clearError = useCallback(() => {
    setManualError(null);
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([goalsQuery.refetch(), reviewSettingsQuery.refetch()]);
  }, [goalsQuery, reviewSettingsQuery]);

  return {
    goals: goalsQuery.data ?? [],
    reviewSettings: reviewSettingsQuery.data ?? null,
    stats: statsQuery.data ?? null,
    isLoading:
      goalsQuery.isLoading ||
      reviewSettingsQuery.isLoading ||
      createGoalMutation.isPending ||
      updateGoalMutation.isPending ||
      deleteGoalMutation.isPending ||
      addMilestoneMutation.isPending ||
      updateMilestoneMutation.isPending ||
      deleteMilestoneMutation.isPending ||
      saveReviewSettingsMutation.isPending ||
      updateReviewSettingsMutation.isPending ||
      completeReviewMutation.isPending,
    error:
      manualError ||
      (goalsQuery.error instanceof Error ? goalsQuery.error : null) ||
      (reviewSettingsQuery.error instanceof Error ? reviewSettingsQuery.error : null) ||
      (statsQuery.error instanceof Error ? statsQuery.error : null),
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoal,
    increaseGoalProgress,
    decreaseGoalProgress,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestone,
    fetchReviewSettings,
    saveReviewSettings,
    updateReviewSettings,
    completeReview,
    fetchStats,
    clearError,
    refetch,
  };
};
