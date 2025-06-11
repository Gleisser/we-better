import { supabase } from '@/core/services/supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/dream-challenges`;

// Types for dream challenges (matching the backend interfaces)
export interface DreamChallenge {
  id: string;
  user_id: string;
  dream_id: string | null;
  title: string;
  description: string;
  duration: number;
  frequency: 'daily' | 'weekly' | 'custom';
  selected_days: number[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  enable_reminders: boolean;
  reminder_time: string | null;
  start_date: string;
  current_day: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDreamChallengeInput {
  dream_id?: string | null;
  title: string;
  description: string;
  duration: number;
  frequency: 'daily' | 'weekly' | 'custom';
  selected_days?: number[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  enable_reminders?: boolean;
  reminder_time?: string | null;
  start_date?: string;
  current_day?: number;
  completed?: boolean;
}

export interface UpdateDreamChallengeInput {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  frequency?: 'daily' | 'weekly' | 'custom';
  selected_days?: number[];
  difficulty_level?: 'easy' | 'medium' | 'hard';
  enable_reminders?: boolean;
  reminder_time?: string | null;
  current_day?: number;
  completed?: boolean;
}

export interface DreamChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  day_number: number;
  completed_at: string;
  notes?: string;
  created_at: string;
}

export interface CreateChallengeProgressInput {
  challenge_id: string;
  day_number: number;
  notes?: string;
}

export interface ChallengeStats {
  total: number;
  active: number;
  completed: number;
  totalDaysCompleted: number;
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
  body?:
    | Record<string, unknown>
    | CreateDreamChallengeInput
    | UpdateDreamChallengeInput
    | CreateChallengeProgressInput
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
      if (response.status === 409) {
        throw new Error('Progress for this day has already been recorded');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // For DELETE operations that don't return content
    if (method === 'DELETE' && response.status === 200) {
      return { success: true } as unknown as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Get all dream challenges with optional filtering
 */
export const getDreamChallenges = async (params?: {
  completed?: boolean;
  dream_id?: string;
  limit?: number;
  offset?: number;
}): Promise<DreamChallenge[]> => {
  try {
    const searchParams = new URLSearchParams();

    if (params?.completed !== undefined) {
      searchParams.append('completed', params.completed.toString());
    }
    if (params?.dream_id) {
      searchParams.append('dream_id', params.dream_id);
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      searchParams.append('offset', params.offset.toString());
    }

    const url = searchParams.toString() ? `${API_URL}?${searchParams}` : API_URL;
    const result = await apiRequest<DreamChallenge[]>(url);
    return result || [];
  } catch (error) {
    console.error('Error getting dream challenges:', error);
    return [];
  }
};

/**
 * Get active challenges (not completed)
 */
export const getActiveChallenges = async (): Promise<DreamChallenge[]> => {
  try {
    const result = await apiRequest<DreamChallenge[]>(`${API_URL}?type=active`);
    return result || [];
  } catch (error) {
    console.error('Error getting active challenges:', error);
    return [];
  }
};

/**
 * Get completed challenges
 */
export const getCompletedChallenges = async (): Promise<DreamChallenge[]> => {
  try {
    const result = await apiRequest<DreamChallenge[]>(`${API_URL}?type=completed`);
    return result || [];
  } catch (error) {
    console.error('Error getting completed challenges:', error);
    return [];
  }
};

/**
 * Get challenge statistics
 */
export const getChallengeStats = async (): Promise<ChallengeStats | null> => {
  try {
    return await apiRequest<ChallengeStats>(`${API_URL}?type=stats`);
  } catch (error) {
    console.error('Error getting challenge stats:', error);
    return null;
  }
};

/**
 * Get a specific challenge by ID
 */
export const getDreamChallengeById = async (id: string): Promise<DreamChallenge | null> => {
  try {
    return await apiRequest<DreamChallenge>(`${API_URL}?id=${id}`);
  } catch (error) {
    console.error(`Error getting challenge with ID ${id}:`, error);
    return null;
  }
};

/**
 * Create a new dream challenge
 */
export const createDreamChallenge = async (
  data: CreateDreamChallengeInput
): Promise<DreamChallenge | null> => {
  try {
    return await apiRequest<DreamChallenge>(API_URL, 'POST', data);
  } catch (error) {
    console.error('Error creating dream challenge:', error);
    throw error; // Re-throw to allow components to handle the error
  }
};

/**
 * Update an existing dream challenge
 */
export const updateDreamChallenge = async (
  data: UpdateDreamChallengeInput
): Promise<DreamChallenge | null> => {
  try {
    return await apiRequest<DreamChallenge>(API_URL, 'PUT', data);
  } catch (error) {
    console.error('Error updating dream challenge:', error);
    throw error;
  }
};

/**
 * Delete a dream challenge
 */
export const deleteDreamChallenge = async (id: string): Promise<boolean> => {
  try {
    const result = await apiRequest<{ success: boolean }>(`${API_URL}?id=${id}`, 'DELETE');
    return result?.success || false;
  } catch (error) {
    console.error('Error deleting dream challenge:', error);
    return false;
  }
};

/**
 * Get challenge progress history
 */
export const getChallengeProgress = async (
  challengeId: string
): Promise<DreamChallengeProgress[]> => {
  try {
    const result = await apiRequest<DreamChallengeProgress[]>(
      `${API_URL}/progress?challenge_id=${challengeId}`
    );
    return result || [];
  } catch (error) {
    console.error('Error getting challenge progress:', error);
    return [];
  }
};

/**
 * Record a day as completed for a challenge
 */
export const markDayComplete = async (
  data: CreateChallengeProgressInput
): Promise<DreamChallengeProgress | null> => {
  try {
    return await apiRequest<DreamChallengeProgress>(`${API_URL}/progress`, 'POST', data);
  } catch (error) {
    console.error('Error marking day complete:', error);
    throw error;
  }
};

/**
 * Delete a progress entry for a specific day (for undoing completion)
 */
export const deleteDayProgress = async (
  challengeId: string,
  dayNumber: number
): Promise<boolean> => {
  try {
    const result = await apiRequest<{ success: boolean }>(
      `${API_URL}/progress?challenge_id=${challengeId}&day_number=${dayNumber}`,
      'DELETE'
    );
    return result?.success || false;
  } catch (error) {
    console.error('Error deleting day progress:', error);
    return false;
  }
};

/**
 * Update challenge progress (increment current_day)
 */
export const updateChallengeProgress = async (
  challengeId: string,
  currentDay: number
): Promise<DreamChallenge | null> => {
  try {
    return await updateDreamChallenge({
      id: challengeId,
      current_day: currentDay,
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
};

/**
 * Mark challenge as completed
 */
export const markChallengeComplete = async (
  challengeId: string
): Promise<DreamChallenge | null> => {
  try {
    return await updateDreamChallenge({
      id: challengeId,
      completed: true,
    });
  } catch (error) {
    console.error('Error marking challenge complete:', error);
    throw error;
  }
};
