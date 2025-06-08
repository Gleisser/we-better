/**
 * API service for Dream Milestones
 * Handles communication with the backend for dream board content milestones
 */

const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

export interface DreamMilestone {
  id: string;
  dream_board_content_id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface CreateDreamMilestoneRequest {
  dream_board_content_id: string;
  title: string;
  description?: string;
  due_date?: string; // YYYY-MM-DD format
}

export interface UpdateDreamMilestoneRequest {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string; // YYYY-MM-DD format
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
 * Get milestones for a specific dream board content item
 */
export async function getDreamMilestonesForContent(contentId: string): Promise<DreamMilestone[]> {
  return apiRequest<DreamMilestone[]>(
    `/dream-milestones?dream_board_content_id=${encodeURIComponent(contentId)}`
  );
}

/**
 * Get milestones for multiple dream board content items
 */
export async function getDreamMilestonesForContents(
  contentIds: string[]
): Promise<Record<string, DreamMilestone[]>> {
  const contentIdsParam = contentIds.join(',');
  return apiRequest<Record<string, DreamMilestone[]>>(
    `/dream-milestones?content_ids=${encodeURIComponent(contentIdsParam)}`
  );
}

/**
 * Create a new dream milestone
 */
export async function createDreamMilestone(
  data: CreateDreamMilestoneRequest
): Promise<DreamMilestone> {
  return apiRequest<DreamMilestone>('/dream-milestones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a dream milestone
 */
export async function updateDreamMilestone(
  data: UpdateDreamMilestoneRequest
): Promise<DreamMilestone> {
  return apiRequest<DreamMilestone>('/dream-milestones', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a dream milestone
 */
export async function deleteDreamMilestone(id: string): Promise<void> {
  return apiRequest<void>(`/dream-milestones?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/**
 * Toggle milestone completion status
 */
export async function toggleMilestoneCompletion(id: string): Promise<DreamMilestone> {
  return apiRequest<DreamMilestone>(`/dream-milestones/${id}/toggle`, {
    method: 'PATCH',
  });
}

/**
 * Get all milestones for the current user (with optional filters)
 */
export async function getAllDreamMilestones(params?: {
  completed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<DreamMilestone[]> {
  const searchParams = new URLSearchParams();

  if (params?.completed !== undefined) {
    searchParams.append('completed', params.completed.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params?.offset !== undefined) {
    searchParams.append('offset', params.offset.toString());
  }

  const queryString = searchParams.toString();
  return apiRequest<DreamMilestone[]>(`/dream-milestones${queryString ? `?${queryString}` : ''}`);
}
