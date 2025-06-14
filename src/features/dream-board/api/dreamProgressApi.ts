import { supabase } from '@/core/services/supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/dream-progress`;

// Types for dream progress
export interface DreamProgress {
  id: string;
  user_id: string;
  dream_board_content_id: string;
  dream_title: string;
  dream_category: string;
  progress_value: number; // 0.0 to 1.0
  previous_value: number | null;
  adjustment_value: number;
  created_at: string;
  updated_at: string;
}

export interface DreamProgressResponse {
  progress_entries: DreamProgress[];
  total: number;
}

export interface DreamProgressTimeline {
  user_id: string;
  dream_board_content_id: string;
  dream_title: string;
  dream_category: string;
  progress_value: number;
  adjustment_value: number;
  created_at: string;
  previous_progress: number | null;
  progress_trend: 'increase' | 'decrease' | 'no_change';
}

export interface LatestDreamProgress {
  id: string;
  user_id: string;
  dream_board_content_id: string;
  dream_title: string;
  dream_category: string;
  progress_value: number;
  previous_value: number | null;
  adjustment_value: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDreamProgressParams {
  dream_board_content_id: string;
  dream_title: string;
  dream_category: string;
  progress_value: number;
  previous_value?: number | null;
  adjustment_value: number;
  use_adjustment?: boolean; // If true, will use adjustment logic
}

export interface AdjustProgressParams {
  dream_id: string;
  dream_title: string;
  dream_category: string;
  adjustment: number; // +0.1 or -0.1 etc.
}

export interface AdjustProgressResponse {
  success: boolean;
  progress_entry: DreamProgress;
  new_progress: number;
}

/**
 * Get the auth token from Supabase session or storage
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Handle API requests with proper authentication and error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, unknown> | CreateDreamProgressParams | AdjustProgressParams
): Promise<T | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    // Implement exponential backoff for retries
    const MAX_RETRIES = 3;
    let retries = 0;
    let response: Response;

    while (true) {
      try {
        response = await fetch(endpoint, config);
        break;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        // Exponential backoff: 1s, 2s, 4s, etc.
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
      }
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Authentication expired');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // For DELETE operations that don't return content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true } as unknown as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Get dream progress entries with optional filtering
 */
export const getDreamProgress = async (params?: {
  dream_board_content_id?: string;
  dream_category?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<DreamProgressResponse | null> => {
  try {
    const searchParams = new URLSearchParams();

    if (params?.dream_board_content_id) {
      searchParams.append('dream_board_content_id', params.dream_board_content_id);
    }
    if (params?.dream_category) {
      searchParams.append('dream_category', params.dream_category);
    }
    if (params?.start_date) {
      searchParams.append('start_date', params.start_date);
    }
    if (params?.end_date) {
      searchParams.append('end_date', params.end_date);
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      searchParams.append('offset', params.offset.toString());
    }

    const url = searchParams.toString() ? `${API_URL}?${searchParams}` : API_URL;
    return await apiRequest<DreamProgressResponse>(url);
  } catch (error) {
    console.error('Error getting dream progress:', error);
    return null;
  }
};

/**
 * Get the latest progress for all dreams or a specific dream
 */
export const getLatestDreamProgress = async (
  dreamBoardContentId?: string
): Promise<LatestDreamProgress[]> => {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('latest_only', 'true');

    if (dreamBoardContentId) {
      searchParams.append('dream_board_content_id', dreamBoardContentId);
    }

    const url = `${API_URL}?${searchParams}`;
    const result = await apiRequest<LatestDreamProgress[]>(url);
    return result || [];
  } catch (error) {
    console.error('Error getting latest dream progress:', error);
    return [];
  }
};

/**
 * Create a new dream progress entry
 */
export const createDreamProgress = async (
  params: CreateDreamProgressParams
): Promise<DreamProgress | null> => {
  try {
    return await apiRequest<DreamProgress>(API_URL, 'POST', params);
  } catch (error) {
    console.error('Error creating dream progress:', error);
    return null;
  }
};

/**
 * Update dream progress by adjusting the current value
 * This is the main function for QuickVision component
 */
export const adjustDreamProgress = async (
  params: AdjustProgressParams
): Promise<AdjustProgressResponse | null> => {
  try {
    return await apiRequest<AdjustProgressResponse>(`${API_URL}/adjust`, 'POST', params);
  } catch (error) {
    console.error('Error adjusting dream progress:', error);
    return null;
  }
};

/**
 * Update an existing dream progress entry
 */
export const updateDreamProgress = async (
  id: string,
  updates: Partial<Omit<CreateDreamProgressParams, 'dream_board_content_id'>>
): Promise<DreamProgress | null> => {
  try {
    return await apiRequest<DreamProgress>(API_URL, 'PUT', { id, ...updates });
  } catch (error) {
    console.error('Error updating dream progress:', error);
    return null;
  }
};

/**
 * Delete a dream progress entry
 */
export const deleteDreamProgress = async (id: string): Promise<boolean> => {
  try {
    const result = await apiRequest<{ success: boolean }>(`${API_URL}?id=${id}`, 'DELETE');
    return result?.success || false;
  } catch (error) {
    console.error('Error deleting dream progress:', error);
    return false;
  }
};

/**
 * Get dream progress timeline for analytics
 */
export const getDreamProgressTimeline = async (
  dreamBoardContentId?: string,
  limit?: number
): Promise<DreamProgressTimeline[]> => {
  try {
    const searchParams = new URLSearchParams();

    if (dreamBoardContentId) {
      searchParams.append('dream_board_content_id', dreamBoardContentId);
    }
    if (limit) {
      searchParams.append('limit', limit.toString());
    }

    const url = searchParams.toString()
      ? `${API_URL}/timeline?${searchParams}`
      : `${API_URL}/timeline`;

    const result = await apiRequest<DreamProgressTimeline[]>(url);
    return result || [];
  } catch (error) {
    console.error('Error getting dream progress timeline:', error);
    return [];
  }
};
