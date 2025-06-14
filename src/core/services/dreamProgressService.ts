import { supabase } from './supabaseClient';

// Update the API URL to point to the actual backend server
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

export interface DreamProgressHistoryParams {
  dream_board_content_id?: string;
  dream_category?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Get the auth token from localStorage or cookie
 * @returns The auth token string or null if not found
 */
const getAuthToken = async (): Promise<string | null> => {
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

  // If no token found, check for cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'sb:token' || name.startsWith('sb-')) {
      return value;
    }
  }

  // Check for the supabase auth cookie directly
  if (document.cookie.includes('sb-')) {
    // Extract the cookie that starts with sb-
    const supabaseCookie = cookies.find(cookie => cookie.trim().startsWith('sb-'));
    if (supabaseCookie) {
      const [, value] = supabaseCookie.trim().split('=');
      try {
        const decodedValue = decodeURIComponent(value);
        const parsedCookie = JSON.parse(decodedValue);
        if (parsedCookie.access_token) {
          return parsedCookie.access_token;
        }
      } catch (error) {
        console.error('Error parsing supabase cookie:', error);
      }
    }
  }

  return null;
};

/**
 * Get dream progress entries with filtering and pagination
 * @param params Filtering and pagination parameters
 * @returns Dream progress entries and total count
 */
export const getDreamProgress = async (
  params: DreamProgressHistoryParams = {}
): Promise<DreamProgressResponse | null> => {
  try {
    const {
      dream_board_content_id,
      dream_category,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
    } = params;
    let url = `${API_URL}?limit=${limit}&offset=${offset}`;

    if (dream_board_content_id) {
      url += `&dream_board_content_id=${dream_board_content_id}`;
    }

    if (dream_category) {
      url += `&dream_category=${dream_category}`;
    }

    if (startDate) {
      url += `&start_date=${startDate}`;
    }

    if (endDate) {
      url += `&end_date=${endDate}`;
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error getting dream progress: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting dream progress:', error);
    return null;
  }
};

/**
 * Get the latest progress for all dreams or a specific dream
 * @param dreamBoardContentId Optional specific dream board content ID
 * @returns Array of latest progress entries
 */
export const getLatestDreamProgress = async (
  dreamBoardContentId?: string
): Promise<LatestDreamProgress[]> => {
  try {
    let url = `${API_URL}?latest_only=true`;

    if (dreamBoardContentId) {
      url += `&dream_board_content_id=${dreamBoardContentId}`;
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error getting latest dream progress: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting latest dream progress:', error);
    return [];
  }
};

/**
 * Adjust dream progress - Main function for QuickVision component
 * @param params The adjustment parameters
 * @returns The updated progress entry and new progress value
 */
export const adjustDreamProgress = async (
  params: AdjustProgressParams
): Promise<AdjustProgressResponse | null> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/adjust`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error adjusting dream progress: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adjusting dream progress:', error);
    return null;
  }
};

/**
 * Create a new dream progress entry
 * @param params The dream progress data
 * @returns The created dream progress entry
 */
export const createDreamProgress = async (params: {
  dream_board_content_id: string;
  dream_title: string;
  dream_category: string;
  progress_value: number;
  previous_value?: number | null;
  adjustment_value: number;
  use_adjustment?: boolean;
}): Promise<DreamProgress | null> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error creating dream progress: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating dream progress:', error);
    return null;
  }
};

/**
 * Update an existing dream progress entry
 * @param id The progress entry ID
 * @param params The updated data
 * @returns The updated dream progress entry
 */
export const updateDreamProgress = async (
  id: string,
  params: {
    progress_value?: number;
    previous_value?: number | null;
    adjustment_value?: number;
    dream_title?: string;
    dream_category?: string;
  }
): Promise<DreamProgress | null> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({ id, ...params }),
    });

    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error updating dream progress: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating dream progress:', error);
    return null;
  }
};

/**
 * Delete a dream progress entry
 * @param id The progress entry ID
 * @returns True if deletion was successful, false otherwise
 */
export const deleteDreamProgress = async (id: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}?id=${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error deleting dream progress with ID ${id}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting dream progress with ID ${id}:`, error);
    return false;
  }
};

/**
 * Get dream progress timeline for analytics
 * @param dreamBoardContentId Optional specific dream board content ID
 * @param limit Maximum number of entries to return
 * @returns Array of timeline entries for progress analytics
 */
export const getDreamProgressTimeline = async (
  dreamBoardContentId?: string,
  limit: number = 100
): Promise<DreamProgressTimeline[]> => {
  try {
    let url = `${API_URL}/timeline?limit=${limit}`;

    if (dreamBoardContentId) {
      url += `&dream_board_content_id=${dreamBoardContentId}`;
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error getting dream progress timeline: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting dream progress timeline:', error);
    return [];
  }
};
