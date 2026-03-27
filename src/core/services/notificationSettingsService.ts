import { supabase } from './supabaseClient';
import { createAppApiUrl } from '@/core/config/appApi';

const API_BASE_URL = createAppApiUrl('/notifications/settings');

export interface NotificationSettingsDto {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  email_goals_reminders: boolean;
  email_habits_reminders: boolean;
  email_weekly_insights: boolean;
  email_milestone_achievements: boolean;
  email_marketing: boolean;
  push_goals_reminders: boolean;
  push_habits_reminders: boolean;
  push_daily_affirmations: boolean;
  push_milestone_achievements: boolean;
  timezone: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  habit_reminder_time: string;
  goal_review_reminder_time: string;
  email_dream_challenge_reminders: boolean;
  push_dream_challenge_reminders: boolean;
  email_habit_streak_achievements: boolean;
  push_habit_streak_achievements: boolean;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for notification settings API:', error);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'PUT' = 'GET',
  body?: Record<string, unknown>
): Promise<T> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
};

class NotificationSettingsService {
  private static instance: NotificationSettingsService;

  private constructor() {}

  public static getInstance(): NotificationSettingsService {
    if (!NotificationSettingsService.instance) {
      NotificationSettingsService.instance = new NotificationSettingsService();
    }
    return NotificationSettingsService.instance;
  }

  async getSettings(): Promise<{ data: NotificationSettingsDto | null; error: string | null }> {
    try {
      const response = await apiRequest<{ settings: NotificationSettingsDto }>(API_BASE_URL);
      return { data: response.settings, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch notification settings',
      };
    }
  }

  async updateSettings(
    updates: Partial<NotificationSettingsDto>
  ): Promise<{ data: NotificationSettingsDto | null; error: string | null }> {
    try {
      const response = await apiRequest<{ settings: NotificationSettingsDto }>(
        API_BASE_URL,
        'PUT',
        updates as Record<string, unknown>
      );
      return { data: response.settings, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update notification settings',
      };
    }
  }
}

export const notificationSettingsService = NotificationSettingsService.getInstance();
export default notificationSettingsService;
