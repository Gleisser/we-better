import { supabase } from './supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/habits`;

// Type definitions matching backend models
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  streak: number;
  start_date: string;
  active: boolean;
  archived: boolean;
  archive_date?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: HabitStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type HabitStatus = 'completed' | 'partial' | 'missed' | 'skipped' | 'rescheduled';

export interface HabitsResponse {
  habits: Habit[];
  total: number;
}

export interface HabitLogsResponse {
  logs: HabitLog[];
  total: number;
}

export interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  archivedHabits: number;
  weeklyCompletionRate: number;
  longestCurrentStreak: number;
  longestEverStreak: number;
  completedThisWeek: number;
  partialThisWeek: number;
  categoriesBreakdown: Record<string, number>;
}

export interface HabitStreak {
  id: string;
  habit_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  streak_start_date?: string;
  last_completed_date?: string;
  updated_at: string;
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
  body?: Record<string, unknown>
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
        // Trigger auth refresh or redirect to login
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
 * HABITS OPERATIONS
 */

// Get all habits with optional filtering
export const getHabits = async (
  category?: string,
  active?: boolean,
  archived?: boolean,
  limit = 20,
  offset = 0
): Promise<HabitsResponse | null> => {
  try {
    let url = `${API_URL}?limit=${limit}&offset=${offset}`;

    if (category) url += `&category=${category}`;
    if (active !== undefined) url += `&active=${active}`;
    if (archived !== undefined) url += `&archived=${archived}`;

    return await apiRequest<HabitsResponse>(url);
  } catch (error) {
    console.error('Error getting habits:', error);
    return null;
  }
};

// Get a specific habit by ID
export const getHabitById = async (id: string): Promise<Habit | null> => {
  try {
    return await apiRequest<Habit>(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error getting habit ${id}:`, error);
    return null;
  }
};

// Create a new habit
export const createHabit = async (
  name: string,
  category: string,
  startDate?: string
): Promise<Habit | null> => {
  try {
    return await apiRequest<Habit>(API_URL, 'POST', { name, category, start_date: startDate });
  } catch (error) {
    console.error('Error creating habit:', error);
    return null;
  }
};

// Update a habit
export const updateHabit = async (
  id: string,
  data: { name?: string; category?: string; active?: boolean; archived?: boolean }
): Promise<Habit | null> => {
  try {
    return await apiRequest<Habit>(`${API_URL}/${id}`, 'PUT', { ...data, id });
  } catch (error) {
    console.error(`Error updating habit ${id}:`, error);
    return null;
  }
};

// Archive a habit (soft delete)
export const archiveHabit = async (id: string): Promise<boolean> => {
  try {
    await apiRequest<{ message: string }>(`${API_URL}/${id}`, 'DELETE');
    return true;
  } catch (error) {
    console.error(`Error archiving habit ${id}:`, error);
    return false;
  }
};

/**
 * HABIT LOGS OPERATIONS
 */

// Get logs for a specific habit
export const getHabitLogs = async (
  habitId: string,
  startDate?: string,
  endDate?: string,
  limit = 30,
  offset = 0
): Promise<HabitLogsResponse | null> => {
  try {
    let url = `${API_URL}/logs?habit_id=${habitId}&limit=${limit}&offset=${offset}`;

    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    return await apiRequest<HabitLogsResponse>(url);
  } catch (error) {
    console.error(`Error getting logs for habit ${habitId}:`, error);
    return null;
  }
};

// Log a habit completion or update an existing log
export const logHabitStatus = async (
  habitId: string,
  date: string,
  status: HabitStatus,
  notes?: string,
  originalStatus?: string
): Promise<HabitLog | null> => {
  try {
    // If originalStatus is provided, store it in the notes field
    // This allows us to preserve specific statuses that don't directly map to API statuses
    const noteWithStatus = originalStatus
      ? `${notes || ''}\n__originalStatus:${originalStatus}__`
      : notes;

    return await apiRequest<HabitLog>(`${API_URL}/logs`, 'POST', {
      habit_id: habitId,
      date,
      status,
      notes: noteWithStatus,
    });
  } catch (error) {
    console.error(`Error logging habit ${habitId}:`, error);
    return null;
  }
};

// Delete a habit log
export const deleteHabitLog = async (logId: string): Promise<boolean> => {
  try {
    await apiRequest<{ message: string }>(`${API_URL}/logs?id=${logId}`, 'DELETE');
    return true;
  } catch (error) {
    console.error(`Error deleting habit log ${logId}:`, error);
    return false;
  }
};

/**
 * STATS OPERATIONS
 */

// Get overall habit statistics
export const getHabitStats = async (): Promise<HabitStats | null> => {
  try {
    return await apiRequest<HabitStats>(`${API_URL}/stats`);
  } catch (error) {
    console.error('Error getting habit stats:', error);
    return null;
  }
};

// Get streak information for a specific habit
export const getHabitStreak = async (habitId: string): Promise<HabitStreak | null> => {
  try {
    return await apiRequest<HabitStreak>(`${API_URL}/stats?habit_id=${habitId}`);
  } catch (error) {
    console.error(`Error getting streak for habit ${habitId}:`, error);
    return null;
  }
};
