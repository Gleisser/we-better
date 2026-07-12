import type { GoalCategory } from '@/core/services/goalsService';
import { createDreamBoard } from '@/core/services/dreamBoardService';
import { createGoal } from '@/core/services/goalsService';
import { createHabit } from '@/core/services/habitsService';
import type { OnboardingFocusArea, OnboardingStarterPlan } from '@/types/onboarding';

const GOAL_CATEGORY_BY_FOCUS: Record<OnboardingFocusArea, GoalCategory> = {
  health: 'fitness',
  relationships: 'personal',
  finances: 'personal',
};

const HABIT_CATEGORY_BY_FOCUS: Record<OnboardingFocusArea, string> = {
  health: 'health',
  relationships: 'relationships',
  finances: 'finances',
};

export const persistStarterPlan = async (plan: OnboardingStarterPlan): Promise<void> => {
  await Promise.all([
    createDreamBoard({
      title: plan.dream.label,
      categories: [plan.focusArea],
      content: [],
    }),
    createGoal(plan.goal.title, GOAL_CATEGORY_BY_FOCUS[plan.focusArea]),
    createHabit(plan.habit.title, HABIT_CATEGORY_BY_FOCUS[plan.focusArea]),
  ]);
};
