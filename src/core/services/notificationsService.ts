import { supabase } from './supabaseClient';
import { createAppApiUrl } from '@/core/config/appApi';

const API_BASE_URL = createAppApiUrl('/notifications');

export type NotificationEventType =
  | 'habit_daily_reminder'
  | 'goal_review_reminder'
  | 'dream_challenge_reminder'
  | 'dream_milestone_due_soon'
  | 'dream_milestone_due_today'
  | 'dream_milestone_overdue'
  | 'affirmation_reminder'
  | 'habit_streak_milestone'
  | 'goal_milestone_completed';

export type NotificationChannel = 'in_app' | 'push' | 'email';

export interface NotificationFeedItemDto {
  id: string;
  event_id: string | null;
  event_type: NotificationEventType;
  title: string;
  body: string;
  cta_url: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsFeedResponse {
  notifications: NotificationFeedItemDto[];
  total: number;
}

export interface UnreadCountResponse {
  unread: number;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for notifications API:', error);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET'
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

class NotificationsService {
  private static instance: NotificationsService;

  private constructor() {}

  public static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  async getNotifications(options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<{ data: NotificationsFeedResponse | null; error: string | null }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit !== undefined) params.set('limit', String(options.limit));
      if (options?.offset !== undefined) params.set('offset', String(options.offset));
      if (options?.unreadOnly) params.set('unread_only', 'true');

      const queryString = params.toString();
      const endpoint = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
      const data = await apiRequest<NotificationsFeedResponse>(endpoint);

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      };
    }
  }

  async getUnreadCount(): Promise<{ data: UnreadCountResponse | null; error: string | null }> {
    try {
      const data = await apiRequest<UnreadCountResponse>(`${API_BASE_URL}/unread-count`);
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch unread count',
      };
    }
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await apiRequest<{ success: boolean }>(`${API_BASE_URL}/${notificationId}/read`, 'PATCH');
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      };
    }
  }

  async markAllAsRead(): Promise<{ success: boolean; error: string | null }> {
    try {
      await apiRequest<{ success: boolean }>(`${API_BASE_URL}/read-all`, 'POST');
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
      };
    }
  }
}

export const notificationsService = NotificationsService.getInstance();
export default notificationsService;
