import React, { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationSettings } from '../useNotificationSettings';
import { useAuth } from '@/shared/hooks/useAuth';
import { notificationSettingsService } from '@/core/services/notificationSettingsService';

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/core/services/notificationSettingsService', () => ({
  notificationSettingsService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedNotificationSettingsService = vi.mocked(notificationSettingsService);

const settingsFixture = {
  email_notifications: true,
  push_notifications: false,
  in_app_notifications: true,
  email_goals_reminders: true,
  email_habits_reminders: true,
  email_weekly_insights: true,
  email_milestone_achievements: true,
  email_marketing: false,
  push_goals_reminders: false,
  push_habits_reminders: false,
  push_daily_affirmations: false,
  push_milestone_achievements: true,
  timezone: 'UTC',
  quiet_hours_enabled: true,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '07:00:00',
  habit_reminder_time: '20:00:00',
  goal_review_reminder_time: '09:00:00',
  email_dream_challenge_reminders: true,
  push_dream_challenge_reminders: false,
  email_habit_streak_achievements: true,
  push_habit_streak_achievements: true,
};

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <StrictMode>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </StrictMode>
    );
  };
};

describe('useNotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      isLoading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: vi.fn(),
    });
    mockedNotificationSettingsService.getSettings.mockResolvedValue({
      data: settingsFixture,
      error: null,
    });
    mockedNotificationSettingsService.updateSettings.mockImplementation(async patch => ({
      data: {
        ...settingsFixture,
        ...patch,
      },
      error: null,
    }));
  });

  it('dedupes the initial settings load across StrictMode remounts and multiple consumers', async () => {
    const { result } = renderHook(
      () => ({
        first: useNotificationSettings(),
        second: useNotificationSettings(),
      }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.first.settings.timezone).toBe('UTC'));
    expect(result.current.second.settings.timezone).toBe('UTC');
    expect(mockedNotificationSettingsService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('optimistically updates settings and persists the server result', async () => {
    const { result } = renderHook(() => useNotificationSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.settings.push_notifications).toBe(false));

    let success: boolean = false;
    await act(async () => {
      success = await result.current.updateSettings({ push_notifications: true });
    });

    expect(success).toBe(true);
    await waitFor(() => expect(result.current.settings.push_notifications).toBe(true));
    expect(mockedNotificationSettingsService.updateSettings).toHaveBeenCalledWith({
      push_notifications: true,
    });
  });
});
