/**
 * API service for Dream Milestone Events
 * Handles communication with the backend for milestone history and progress analytics
 */

const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export interface DreamMilestoneEvent {
  id: string;
  user_id: string;
  dream_milestone_id: string;
  dream_board_content_id: string;
  event_type: 'created' | 'completed' | 'uncompleted' | 'updated' | 'deleted';
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ProgressChartPoint {
  date: string;
  percentage: number;
  milestone_title?: string;
  event_type?: string;
}

export interface MilestoneEventStats {
  total_events: number;
  completions: number;
  uncompletion: number;
  created: number;
  updated: number;
  deleted: number;
}

export interface CreateMilestoneEventRequest {
  dream_milestone_id: string;
  dream_board_content_id: string;
  event_type: 'created' | 'completed' | 'uncompleted' | 'updated' | 'deleted';
  event_data?: Record<string, unknown>;
}

// Import supabase client for authentication
import { supabase } from '@/core/services/supabaseClient';

// Helper to get auth token using the same method as other services
async function getAuthToken(): Promise<string | null> {
  try {
    // Get the session directly from Supabase client
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return data.session.access_token;
    }
  } catch (error) {
    console.error('Error getting session from Supabase:', error);
  }

  // Use the correct storage key as defined in supabaseClient.ts
  const SUPABASE_AUTH_TOKEN_KEY = 'we-better-auth-token';

  // Try to get the token from localStorage
  const token =
    localStorage.getItem(SUPABASE_AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(SUPABASE_AUTH_TOKEN_KEY);

  if (token) {
    try {
      // Parse the token if it's in JSON format
      const parsedToken = JSON.parse(token);

      // Access the session data which contains the access token
      if (parsedToken.session?.access_token) {
        return parsedToken.session.access_token;
      }

      // Fallback to direct access_token if structure is different
      if (parsedToken.access_token) {
        return parsedToken.access_token;
      }
    } catch {
      // If not in JSON format, return the token as is
      return token;
    }
  }

  return null;
}

// Helper to make authenticated API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get progress timeline data for a specific dream board content
 */
export async function getProgressTimelineForContent(
  contentId: string,
  startDate?: string,
  endDate?: string
): Promise<ProgressChartPoint[]> {
  const params = new URLSearchParams({
    dream_board_content_id: contentId,
  });

  if (startDate) {
    params.append('start_date', startDate);
  }

  if (endDate) {
    params.append('end_date', endDate);
  }

  return apiRequest<ProgressChartPoint[]>(
    `/milestone-events/progress-timeline?${params.toString()}`
  );
}

/**
 * Get progress timeline data for multiple dream board contents
 */
export async function getProgressTimelineForContents(
  contentIds: string[]
): Promise<Record<string, ProgressChartPoint[]>> {
  const contentIdsParam = contentIds.join(',');
  return apiRequest<Record<string, ProgressChartPoint[]>>(
    `/milestone-events/progress-timeline?content_ids=${encodeURIComponent(contentIdsParam)}`
  );
}

/**
 * Get milestone events for a specific dream board content
 */
export async function getMilestoneEventsForContent(
  contentId: string,
  eventType?: string,
  startDate?: string,
  endDate?: string,
  limit?: number,
  offset?: number
): Promise<DreamMilestoneEvent[]> {
  const params = new URLSearchParams({
    dream_board_content_id: contentId,
  });

  if (eventType) {
    params.append('event_type', eventType);
  }

  if (startDate) {
    params.append('start_date', startDate);
  }

  if (endDate) {
    params.append('end_date', endDate);
  }

  if (limit) {
    params.append('limit', limit.toString());
  }

  if (offset) {
    params.append('offset', offset.toString());
  }

  return apiRequest<DreamMilestoneEvent[]>(`/milestone-events?${params.toString()}`);
}

/**
 * Get milestone events for multiple dream board contents
 */
export async function getMilestoneEventsForContents(
  contentIds: string[]
): Promise<Record<string, DreamMilestoneEvent[]>> {
  const contentIdsParam = contentIds.join(',');
  return apiRequest<Record<string, DreamMilestoneEvent[]>>(
    `/milestone-events?content_ids=${encodeURIComponent(contentIdsParam)}`
  );
}

/**
 * Get milestone event statistics for a dream board content
 */
export async function getMilestoneEventStatsForContent(
  contentId: string,
  startDate?: string,
  endDate?: string
): Promise<MilestoneEventStats> {
  const params = new URLSearchParams({
    stats: 'true',
    dream_board_content_id: contentId,
  });

  if (startDate) {
    params.append('start_date', startDate);
  }

  if (endDate) {
    params.append('end_date', endDate);
  }

  return apiRequest<MilestoneEventStats>(`/milestone-events?${params.toString()}`);
}

/**
 * Create a new milestone event (manual event creation if needed)
 */
export async function createMilestoneEvent(
  data: CreateMilestoneEventRequest
): Promise<DreamMilestoneEvent> {
  return apiRequest<DreamMilestoneEvent>('/milestone-events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get a specific milestone event by ID
 */
export async function getMilestoneEventById(id: string): Promise<DreamMilestoneEvent> {
  return apiRequest<DreamMilestoneEvent>(`/milestone-events/${id}`);
}

/**
 * Create a correction event for a milestone event
 */
export async function correctMilestoneEvent(
  id: string,
  correctionReason: string
): Promise<DreamMilestoneEvent> {
  return apiRequest<DreamMilestoneEvent>(`/milestone-events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      correction_reason: correctionReason,
    }),
  });
}
