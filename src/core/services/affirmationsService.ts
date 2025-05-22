/**
 * Affirmations Service - API integration for affirmations management
 * Follows the same patterns as goalsService for consistency
 */

import { supabase } from './supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/affirmations`;

// Affirmation categories matching the backend
export type AffirmationCategory =
  | 'personal'
  | 'beauty'
  | 'blessing'
  | 'gratitude'
  | 'happiness'
  | 'health'
  | 'love'
  | 'money'
  | 'sleep'
  | 'spiritual';

// Affirmation intensity levels
export type AffirmationIntensity = 1 | 2 | 3; // 1: gentle, 2: moderate, 3: powerful

// Reminder frequency options
export type ReminderFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

// Main personal affirmation entity from API
export interface PersonalAffirmation {
  id: string;
  user_id: string;
  text: string;
  category: AffirmationCategory;
  intensity: AffirmationIntensity;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Affirmation reminder settings
export interface AffirmationReminderSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  reminder_time: string; // Time in HH:MM format
  frequency: ReminderFrequency;
  days_of_week?: number[]; // Array of day numbers (0=Sunday, 1=Monday, etc.)
  notification_sound?: string;
  notification_message?: string;
  created_at: string;
  updated_at: string;
}

// Affirmation streak tracking
export interface AffirmationStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  streak_start_date?: string; // ISO date string
  last_affirmed_date?: string; // ISO date string
  total_affirmations: number;
  updated_at: string;
}

// Daily affirmation log entry
export interface AffirmationLog {
  id: string;
  user_id: string;
  affirmation_id?: string; // Optional reference to personal affirmation
  affirmation_text: string; // Store the text for history
  date: string; // ISO date string
  affirmed_at: string; // ISO date-time string
  created_at: string; // ISO date-time string
}

// Affirmation statistics
export interface AffirmationStats {
  streak: AffirmationStreak;
  weekly_count: number;
  monthly_count: number;
  total_count: number;
  last_7_days: Array<{
    date: string;
    count: number;
  }>;
  calculated_metrics?: {
    weekly_average: number;
    monthly_average: number;
    streak_percentage: number;
    consistency_score: number;
    milestone_progress: {
      current: number;
      next_milestone: number;
      progress_percentage: number;
      milestone_name: string;
    };
    longest_streak_achievement?: {
      level: string;
      description: string;
      color: string;
    };
  };
}

// API Response types
export interface AffirmationLogsResponse {
  logs: AffirmationLog[];
  total: number;
}

export interface PersonalAffirmationResponse {
  affirmation: PersonalAffirmation | null;
}

export interface TodayStatusResponse {
  affirmed_today: boolean;
}

// API Error type
export interface ApiError {
  error: string;
  status?: number;
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
 * PERSONAL AFFIRMATIONS API FUNCTIONS
 */

// Fetch personal affirmation for the user
export const fetchPersonalAffirmation = async (): Promise<PersonalAffirmation | null> => {
  try {
    const response = await apiRequest<PersonalAffirmationResponse>(API_URL);
    return response?.affirmation || null;
  } catch (error) {
    console.error('Error getting personal affirmation:', error);
    return null;
  }
};

// Create a new personal affirmation
export const createPersonalAffirmation = async (
  text: string,
  category?: AffirmationCategory,
  intensity?: AffirmationIntensity
): Promise<PersonalAffirmation | null> => {
  try {
    return await apiRequest<PersonalAffirmation>(API_URL, 'POST', {
      text,
      category,
      intensity,
    });
  } catch (error) {
    console.error('Error creating personal affirmation:', error);
    return null;
  }
};

// Update personal affirmation
export const updatePersonalAffirmation = async (
  id: string,
  updates: {
    text?: string;
    category?: AffirmationCategory;
    intensity?: AffirmationIntensity;
    is_active?: boolean;
  }
): Promise<PersonalAffirmation | null> => {
  try {
    return await apiRequest<PersonalAffirmation>(API_URL, 'PUT', {
      id,
      ...updates,
    });
  } catch (error) {
    console.error('Error updating personal affirmation:', error);
    return null;
  }
};

// Delete personal affirmation
export const deletePersonalAffirmation = async (id: string): Promise<boolean> => {
  try {
    const response = await apiRequest<{ success: boolean }>(`${API_URL}?id=${id}`, 'DELETE');
    return response?.success || false;
  } catch (error) {
    console.error('Error deleting personal affirmation:', error);
    return false;
  }
};

/**
 * AFFIRMATION LOGGING API FUNCTIONS
 */

// Log an affirmation (when user clicks "I Affirm")
export const logAffirmation = async (
  affirmationText: string,
  affirmationId?: string,
  date?: string
): Promise<AffirmationLog | null> => {
  try {
    return await apiRequest<AffirmationLog>(API_URL, 'POST', {
      action: 'log_affirmation',
      affirmation_text: affirmationText,
      affirmation_id: affirmationId,
      date: date || new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error logging affirmation:', error);
    return null;
  }
};

// Get affirmation logs
export const fetchAffirmationLogs = async (
  startDate?: string,
  endDate?: string,
  limit = 20,
  offset = 0
): Promise<AffirmationLogsResponse | null> => {
  try {
    let url = `${API_URL}?action=logs&limit=${limit}&offset=${offset}`;

    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    return await apiRequest<AffirmationLogsResponse>(url);
  } catch (error) {
    console.error('Error getting affirmation logs:', error);
    return null;
  }
};

// Check if user has affirmed today
export const checkTodayStatus = async (): Promise<boolean> => {
  try {
    const response = await apiRequest<TodayStatusResponse>(`${API_URL}?action=today`);
    return response?.affirmed_today || false;
  } catch (error) {
    console.error("Error checking today's status:", error);
    return false;
  }
};

/**
 * STREAK AND STATISTICS API FUNCTIONS
 */

// Fetch affirmation streak
export const fetchAffirmationStreak = async (): Promise<AffirmationStreak | null> => {
  try {
    return await apiRequest<AffirmationStreak>(`${API_URL}/stats?type=streak`);
  } catch (error) {
    console.error('Error getting affirmation streak:', error);
    return null;
  }
};

// Fetch comprehensive affirmation statistics
export const fetchAffirmationStats = async (): Promise<AffirmationStats | null> => {
  try {
    return await apiRequest<AffirmationStats>(`${API_URL}/stats?type=overview`);
  } catch (error) {
    console.error('Error getting affirmation stats:', error);
    return null;
  }
};

// Fetch basic stats (backwards compatibility)
export const fetchBasicStats = async (): Promise<AffirmationStats | null> => {
  try {
    return await apiRequest<AffirmationStats>(`${API_URL}?action=stats`);
  } catch (error) {
    console.error('Error getting basic affirmation stats:', error);
    return null;
  }
};

/**
 * REMINDER SETTINGS API FUNCTIONS
 */

// Fetch reminder settings
export const fetchReminderSettings = async (): Promise<AffirmationReminderSettings | null> => {
  try {
    return await apiRequest<AffirmationReminderSettings>(`${API_URL}/reminders`);
  } catch (error) {
    console.error('Error getting reminder settings:', error);
    return null;
  }
};

// Create or update reminder settings
export const upsertReminderSettings = async (settings: {
  is_enabled: boolean;
  reminder_time: string;
  frequency: ReminderFrequency;
  days_of_week?: number[];
  notification_sound?: string;
  notification_message?: string;
}): Promise<AffirmationReminderSettings | null> => {
  try {
    return await apiRequest<AffirmationReminderSettings>(`${API_URL}/reminders`, 'POST', settings);
  } catch (error) {
    console.error('Error creating/updating reminder settings:', error);
    return null;
  }
};

// Update reminder settings
export const updateReminderSettings = async (settings: {
  is_enabled?: boolean;
  reminder_time?: string;
  frequency?: ReminderFrequency;
  days_of_week?: number[];
  notification_sound?: string;
  notification_message?: string;
}): Promise<AffirmationReminderSettings | null> => {
  try {
    return await apiRequest<AffirmationReminderSettings>(`${API_URL}/reminders`, 'PUT', settings);
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    return null;
  }
};

/**
 * UTILITY FUNCTIONS
 */

// Transform backend time format to frontend format
export const transformTimeFormat = (time: string): string => {
  // Backend stores as HH:MM:SS, frontend expects HH:MM
  return time.substring(0, 5);
};

// Transform frontend time format to backend format
export const transformTimeToBackend = (time: string): string => {
  // Frontend sends HH:MM, backend expects HH:MM:SS
  return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
};

// Calculate days of week for frequency
export const getDaysOfWeekForFrequency = (frequency: ReminderFrequency): number[] => {
  switch (frequency) {
    case 'daily':
      return [0, 1, 2, 3, 4, 5, 6]; // All days
    case 'weekdays':
      return [1, 2, 3, 4, 5]; // Monday to Friday
    case 'weekends':
      return [0, 6]; // Saturday and Sunday
    case 'custom':
    default:
      return []; // Will be set manually
  }
};
