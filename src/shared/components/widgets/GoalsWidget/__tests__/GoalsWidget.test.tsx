import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GoalsWidget from '../GoalsWidget';
import { useGoals } from '@/shared/hooks/useGoals';

vi.mock('@/shared/hooks/useGoals', () => ({
  useGoals: vi.fn(),
}));

vi.mock('@/shared/hooks/useTimeBasedTheme', () => ({
  useTimeBasedTheme: () => ({
    theme: {
      gradientStart: '#111111',
      gradientMiddle: '#222222',
      gradientEnd: '#333333',
    },
  }),
}));

vi.mock('@/shared/hooks/useTranslation', () => ({
  useDashboardTranslation: () => ({
    t: (key: string) => {
      if (key === 'widgets.goals.reviewSettings.title') {
        return 'Review settings';
      }

      if (key === 'widgets.goals.reviewSettings') {
        return 'WRONG_PARENT_KEY';
      }

      return key;
    },
    currentLanguage: 'en',
  }),
}));

vi.mock('../ReviewTimer', () => ({
  ReviewTimer: () => <div data-testid="review-timer" />,
}));

vi.mock('../ReviewSettings', () => ({
  ReviewSettingsModal: () => null,
}));

vi.mock('../GoalFormModal', () => ({
  GoalFormModal: () => null,
}));

vi.mock('../GoalActionsMenu', () => ({
  GoalActionsMenu: () => null,
}));

vi.mock('../ConfirmationModal', () => ({
  ConfirmationModal: () => null,
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedUseGoals = vi.mocked(useGoals);

describe('GoalsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseGoals.mockReturnValue({
      goals: [],
      reviewSettings: null,
      stats: null,
      isLoading: false,
      error: null,
      fetchGoals: vi.fn(),
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
      refreshGoal: vi.fn(),
      increaseGoalProgress: vi.fn(),
      decreaseGoalProgress: vi.fn(),
      addMilestone: vi.fn(),
      updateMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
      toggleMilestone: vi.fn(),
      fetchReviewSettings: vi.fn(),
      saveReviewSettings: vi.fn(),
      updateReviewSettings: vi.fn(),
      completeReview: vi.fn(),
      fetchStats: vi.fn(),
      clearError: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('uses the review-settings leaf translation for the settings button label', () => {
    render(<GoalsWidget />);

    expect(screen.getByRole('button', { name: 'Review settings' })).not.toBeNull();
  });
});
