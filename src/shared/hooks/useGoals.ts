import { useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
  InitialDataFunction,
} from '@tanstack/react-query';
import { useAuth } from './useAuth'; // Assuming useAuth is in the same directory or appropriately aliased
import * as goalsService from '@/core/services/goalsService';
import {
  Goal,
  GoalWithMilestones,
  Milestone,
  UserReviewSettings,
  GoalStats,
  GoalCategory,
  ReviewFrequency,
  GoalsResponse,
} from '@/core/services/goalsService';

// Query Keys
export const GOALS_QUERY_KEY = 'goals'; // Exported
export const GOAL_DETAILS_QUERY_KEY = 'goalDetails'; // For individual goal fetching if needed
export const GOAL_STATS_QUERY_KEY = 'goalStats';
const GOAL_REVIEW_SETTINGS_QUERY_KEY = 'goalReviewSettings';

// Type for goal creation variables
interface CreateGoalVariables {
  title: string;
  category: GoalCategory;
  targetDate?: string;
}

// Type for goal update variables
interface UpdateGoalVariables {
  goalId: string;
  updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'milestones'>>;
}

// Type for milestone creation variables
interface CreateMilestoneVariables {
  goalId: string;
  title: string;
}

// Type for milestone update variables
interface UpdateMilestoneVariables {
  goalId: string;
  milestoneId: string;
  updates: Partial<Omit<Milestone, 'id' | 'goal_id' | 'created_at' | 'updated_at'>>;
}

// Type for review settings variables
interface SaveReviewSettingsVariables {
  frequency: ReviewFrequency;
  notification_preferences: Record<string, boolean>;
  next_review_date?: string;
  reminder_days?: number;
}

// Hook return type
export interface UseGoalsReturn {
  goalsQuery: UseQueryResult<GoalsResponse | null, Error>;
  goalStatsQuery: UseQueryResult<GoalStats | null, Error>;
  reviewSettingsQuery: UseQueryResult<UserReviewSettings | null, Error>;

  createGoalMutation: UseMutationResult<Goal | null, Error, CreateGoalVariables>;
  updateGoalMutation: UseMutationResult<Goal | null, Error, UpdateGoalVariables>;
  deleteGoalMutation: UseMutationResult<boolean, Error, string>;

  increaseGoalProgressMutation: UseMutationResult<Goal | null, Error, { goalId: string; increment?: number }>;
  decreaseGoalProgressMutation: UseMutationResult<Goal | null, Error, { goalId: string; decrement?: number }>;

  addMilestoneMutation: UseMutationResult<Milestone | null, Error, CreateMilestoneVariables>;
  updateMilestoneMutation: UseMutationResult<Milestone | null, Error, UpdateMilestoneVariables>;
  deleteMilestoneMutation: UseMutationResult<boolean, Error, { goalId: string; milestoneId: string }>;
  toggleMilestoneMutation: UseMutationResult<Milestone | null, Error, { goalId: string; milestoneId: string; completed: boolean }>;


  saveReviewSettingsMutation: UseMutationResult<UserReviewSettings | null, Error, SaveReviewSettingsVariables>;
  completeReviewMutation: UseMutationResult<UserReviewSettings | null, Error, void>;

  refreshGoal: (goalId: string) => Promise<void>;
  refetchAllGoals: (category?: GoalCategory, includeMilestones?: boolean) => Promise<void>;
}

interface UseGoalsProps {
  initialGoals?: GoalsResponse | null | InitialDataFunction<GoalsResponse | null>;
  initialCategory?: GoalCategory;
  initialIncludeMilestones?: boolean;
}

export const useGoals = ({
  initialGoals,
  initialCategory,
  initialIncludeMilestones = true,
}: UseGoalsProps = {}): UseGoalsReturn => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const STALE_TIME = 1000 * 60 * 5; // 5 minutes

  // --- Queries ---

  const goalsQueryKey: QueryKey = [GOALS_QUERY_KEY, initialCategory, initialIncludeMilestones];
  const goalsQuery = useQuery<GoalsResponse | null, Error, GoalsResponse | null, QueryKey>(
    goalsQueryKey,
    () => goalsService.fetchGoals(initialCategory, initialIncludeMilestones),
    {
      enabled: isAuthenticated,
      initialData: initialGoals,
      staleTime: STALE_TIME,
      select: (data) => {
        if (!data) return null;
        // Ensure milestones array exists
        const goalsWithMilestones: GoalWithMilestones[] = data.goals.map(goal => ({
          ...goal,
          milestones: 'milestones' in goal && Array.isArray(goal.milestones) ? goal.milestones : [],
        })) as GoalWithMilestones[];
        return { ...data, goals: goalsWithMilestones };
      },
    }
  );

  const goalStatsQueryKey: QueryKey = [GOAL_STATS_QUERY_KEY];
  const goalStatsQuery = useQuery<GoalStats | null, Error, GoalStats | null, QueryKey>(
    goalStatsQueryKey,
    goalsService.fetchGoalStats,
    { enabled: isAuthenticated }
  );

  const reviewSettingsQueryKey: QueryKey = [GOAL_REVIEW_SETTINGS_QUERY_KEY];
  const reviewSettingsQuery = useQuery<UserReviewSettings | null, Error, UserReviewSettings | null, QueryKey>(
    reviewSettingsQueryKey,
    goalsService.fetchReviewSettings,
    { enabled: isAuthenticated }
  );

  // --- Mutations ---

  // Create Goal
  const createGoalMutation = useMutation<Goal | null, Error, CreateGoalVariables>(
    ({ title, category, targetDate }) => goalsService.createGoal(title, category, 0, targetDate),
    {
      enabled: isAuthenticated,
      onSuccess: (newGoal) => {
        queryClient.invalidateQueries(GOALS_QUERY_KEY);
        queryClient.invalidateQueries(GOAL_STATS_QUERY_KEY);
        // Optimistically add to the list if desired, though invalidation is usually sufficient
        if (newGoal) {
           queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
            if (!oldData) return { goals: [{...newGoal, milestones: []}], total: 1};
            const newGoalWithMilestones: GoalWithMilestones = {...newGoal, milestones: []};
            return {
              ...oldData,
              goals: [newGoalWithMilestones, ...oldData.goals],
              total: oldData.total + 1,
            };
          });
        }
      },
    }
  );

  // Update Goal
  const updateGoalMutation = useMutation<Goal | null, Error, UpdateGoalVariables>(
    ({ goalId, updates }) => goalsService.updateGoal(goalId, updates),
    {
      enabled: isAuthenticated,
      onMutate: async ({ goalId, updates }) => {
        await queryClient.cancelQueries(goalsQueryKey);
        const previousGoalsResponse = queryClient.getQueryData<GoalsResponse | null>(goalsQueryKey);

        queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            goals: oldData.goals.map((goal) =>
              goal.id === goalId ? { ...goal, ...updates } : goal
            ),
          };
        });
        return { previousGoalsResponse };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousGoalsResponse) {
          queryClient.setQueryData(goalsQueryKey, context.previousGoalsResponse);
        }
      },
      onSuccess: (updatedGoal, variables) => {
        if (updatedGoal) {
          // Update the goal in the main goals list
          queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
            if (!oldData) return null;
            return {
              ...oldData,
              goals: oldData.goals.map((g) =>
                g.id === variables.goalId ? { ...g, ...updatedGoal } : g
              ),
            };
          });
          // Update the specific goal details cache
          queryClient.setQueryData([GOAL_DETAILS_QUERY_KEY, variables.goalId], updatedGoal);
        }
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries(goalsQueryKey);
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, variables.goalId]);
        queryClient.invalidateQueries(GOAL_STATS_QUERY_KEY);
      },
    }
  );

  // Delete Goal
  const deleteGoalMutation = useMutation<boolean, Error, string>(
    (goalId) => goalsService.deleteGoal(goalId),
    {
      enabled: isAuthenticated,
      onMutate: async (goalId) => {
        await queryClient.cancelQueries(goalsQueryKey);
        const previousGoalsResponse = queryClient.getQueryData<GoalsResponse | null>(goalsQueryKey);

        queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            goals: oldData.goals.filter((goal) => goal.id !== goalId),
            total: oldData.total -1,
          };
        });
        return { previousGoalsResponse };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousGoalsResponse) {
          queryClient.setQueryData(goalsQueryKey, context.previousGoalsResponse);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(GOALS_QUERY_KEY);
        queryClient.invalidateQueries(GOAL_STATS_QUERY_KEY);
      },
    }
  );

  // Increase Goal Progress
  const increaseGoalProgressMutation = useMutation<Goal | null, Error, { goalId: string; increment?: number }>(
    ({ goalId, increment }) => goalsService.increaseProgress(goalId, increment),
    {
      enabled: isAuthenticated,
      onMutate: async ({ goalId, increment = 5 }) => {
        await queryClient.cancelQueries(goalsQueryKey);
        const previousGoalsResponse = queryClient.getQueryData<GoalsResponse | null>(goalsQueryKey);
        queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            goals: oldData.goals.map((g) =>
              g.id === goalId ? { ...g, progress: Math.min(100, g.progress + increment) } : g
            ),
          };
        });
        return { previousGoalsResponse };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousGoalsResponse) {
          queryClient.setQueryData(goalsQueryKey, context.previousGoalsResponse);
        }
      },
      onSuccess: (updatedGoal, variables) => {
        if (updatedGoal) {
          // Update the goal in the main goals list
          queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
            if (!oldData) return null;
            return {
              ...oldData,
              goals: oldData.goals.map((g) =>
                g.id === variables.goalId ? { ...g, ...updatedGoal } : g
              ),
            };
          });
          // Update the specific goal details cache
          queryClient.setQueryData([GOAL_DETAILS_QUERY_KEY, variables.goalId], updatedGoal);
        }
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries(goalsQueryKey);
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, variables.goalId]);
        queryClient.invalidateQueries(GOAL_STATS_QUERY_KEY);
      },
    }
  );

    // Decrease Goal Progress
  const decreaseGoalProgressMutation = useMutation<Goal | null, Error, { goalId: string; decrement?: number }>(
    ({ goalId, decrement }) => goalsService.decreaseProgress(goalId, decrement),
    {
      enabled: isAuthenticated,
      onMutate: async ({ goalId, decrement = 5 }) => {
        await queryClient.cancelQueries(goalsQueryKey);
        const previousGoalsResponse = queryClient.getQueryData<GoalsResponse | null>(goalsQueryKey);
        queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            goals: oldData.goals.map((g) =>
              g.id === goalId ? { ...g, progress: Math.max(0, g.progress - decrement) } : g
            ),
          };
        });
        return { previousGoalsResponse };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousGoalsResponse) {
          queryClient.setQueryData(goalsQueryKey, context.previousGoalsResponse);
        }
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries(goalsQueryKey);
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, variables.goalId]);
        queryClient.invalidateQueries(GOAL_STATS_QUERY_KEY);
      },
    }
  );


  // Add Milestone
  const addMilestoneMutation = useMutation<Milestone | null, Error, CreateMilestoneVariables>(
    ({ goalId, title }) => goalsService.createMilestone(goalId, title),
    {
      enabled: isAuthenticated,
      onSuccess: (newMilestone, { goalId }) => {
        queryClient.invalidateQueries(goalsQueryKey); // Could be more specific if goals have individual keys
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, goalId]);

        // Optimistic update for the milestone list in the specific goal
        if (newMilestone) {
            queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
            if (!oldData) return null;
            return {
              ...oldData,
              goals: oldData.goals.map((g) => {
                if (g.id === goalId) {
                  const currentGoal = g as GoalWithMilestones;
                  return {
                    ...currentGoal,
                    milestones: [...(currentGoal.milestones || []), newMilestone],
                  };
                }
                return g;
              }),
            };
          });
        }
      },
    }
  );

  // Update Milestone
  const updateMilestoneMutation = useMutation<Milestone | null, Error, UpdateMilestoneVariables>(
    ({ goalId, milestoneId, updates }) => goalsService.updateMilestone(goalId, milestoneId, updates),
    {
      enabled: isAuthenticated,
      onMutate: async ({ goalId, milestoneId, updates }) => {
        await queryClient.cancelQueries(goalsQueryKey);
        const previousGoalsResponse = queryClient.getQueryData<GoalsResponse | null>(goalsQueryKey);

        queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            goals: oldData.goals.map((g) => {
              if (g.id === goalId) {
                 const currentGoal = g as GoalWithMilestones;
                return {
                  ...currentGoal,
                  milestones: (currentGoal.milestones || []).map((m) =>
                    m.id === milestoneId ? { ...m, ...updates } : m
                  ),
                };
              }
              return g;
            }),
          };
        });
        return { previousGoalsResponse };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousGoalsResponse) {
          queryClient.setQueryData(goalsQueryKey, context.previousGoalsResponse);
        }
      },
      onSettled: (_data, _error, { goalId }) => {
        queryClient.invalidateQueries(goalsQueryKey);
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, goalId]);
      },
    }
  );

  // Delete Milestone
  const deleteMilestoneMutation = useMutation<boolean, Error, { goalId: string; milestoneId: string }>(
    ({ goalId, milestoneId }) => goalsService.deleteMilestone(goalId, milestoneId),
    {
      enabled: isAuthenticated,
      onMutate: async ({ goalId, milestoneId }) => {
        await queryClient.cancelQueries(goalsQueryKey);
        const previousGoalsResponse = queryClient.getQueryData<GoalsResponse | null>(goalsQueryKey);

        queryClient.setQueryData<GoalsResponse | null>(goalsQueryKey, (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            goals: oldData.goals.map((g) => {
              if (g.id === goalId) {
                const currentGoal = g as GoalWithMilestones;
                return {
                  ...currentGoal,
                  milestones: (currentGoal.milestones || []).filter((m) => m.id !== milestoneId),
                };
              }
              return g;
            }),
          };
        });
        return { previousGoalsResponse };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousGoalsResponse) {
          queryClient.setQueryData(goalsQueryKey, context.previousGoalsResponse);
        }
      },
      onSettled: (_data, _error, { goalId }) => {
        queryClient.invalidateQueries(goalsQueryKey);
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, goalId]);
      },
    }
  );
  
  // Toggle Milestone Completion (uses updateMilestoneMutation logic)
   const toggleMilestoneMutation = useMutation<
    Milestone | null,
    Error,
    { goalId: string; milestoneId: string; completed: boolean }
  >(
    ({ goalId, milestoneId, completed }) =>
      goalsService.toggleMilestoneCompletion(goalId, milestoneId, completed),
    {
      enabled: isAuthenticated,
      // We can use similar onMutate/onError as updateMilestoneMutation if direct optimistic update is desired
      // For now, relying on onSettled invalidation.
      onSettled: (_data, _error, { goalId }) => {
        queryClient.invalidateQueries(goalsQueryKey);
        queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, goalId]);
      },
    }
  );


  // Save Review Settings (Upsert)
  const saveReviewSettingsMutation = useMutation<UserReviewSettings | null, Error, SaveReviewSettingsVariables>(
    (settings) => goalsService.upsertReviewSettings(settings),
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
        queryClient.setQueryData(reviewSettingsQueryKey, data); // Update cache directly
        queryClient.invalidateQueries(reviewSettingsQueryKey); // Also invalidate to be sure
      },
    }
  );

  // Complete Review
  const completeReviewMutation = useMutation<UserReviewSettings | null, Error, void>(
    () => goalsService.completeReview(),
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
        queryClient.setQueryData(reviewSettingsQueryKey, data);
        queryClient.invalidateQueries(reviewSettingsQueryKey);
      },
    }
  );

  // --- Utility Functions ---
  const refreshGoal = useCallback(
    async (goalId: string): Promise<void> => {
      // Invalidate the specific goal details if such a query exists, or the general list.
      await queryClient.invalidateQueries([GOAL_DETAILS_QUERY_KEY, goalId]);
      // Also refetch the main goals list as it might contain the updated goal.
      await queryClient.invalidateQueries(goalsQueryKey);
      // Optionally, directly refetch if immediate update is critical:
      // await queryClient.refetchQueries([GOAL_DETAILS_QUERY_KEY, goalId]);
      // await queryClient.refetchQueries(goalsQueryKey);
    },
    [queryClient, goalsQueryKey]
  );

  const refetchAllGoals = useCallback(
    async (category?: GoalCategory, includeMilestones = true): Promise<void> => {
      // Update the query key for the main goalsQuery if category/includeMilestones changed
      // This is a bit complex as useQuery doesn't dynamically change keys like that.
      // Instead, components using useGoals should pass these as params to useGoals itself,
      // and the goalsQueryKey will be reactive.
      // For a manual refetch with potentially different params, it's better to trigger invalidation.
      queryClient.invalidateQueries([GOALS_QUERY_KEY, category, includeMilestones]);
      await goalsQuery.refetch(); // Refetch the current goalsQuery
    },
    [queryClient, goalsQuery]
  );


  return {
    goalsQuery,
    goalStatsQuery,
    reviewSettingsQuery,
    createGoalMutation,
    updateGoalMutation,
    deleteGoalMutation,
    increaseGoalProgressMutation,
    decreaseGoalProgressMutation,
    addMilestoneMutation,
    updateMilestoneMutation,
    deleteMilestoneMutation,
    toggleMilestoneMutation,
    saveReviewSettingsMutation,
    completeReviewMutation,
    refreshGoal,
    refetchAllGoals,
  };
};
