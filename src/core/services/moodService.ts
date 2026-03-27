import { supabase } from './supabaseClient';
import { createAppApiUrl } from '@/core/config/appApi';

const API_URL = createAppApiUrl('/mood');

export type MoodId = 'elated' | 'bright' | 'balanced' | 'low' | 'drained';
export type MoodPulseDirection = 'up' | 'down' | 'stable' | 'insufficient_data';

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  mood_id: MoodId;
  created_at: string;
  updated_at: string;
}

export interface MoodEntriesResponse {
  entries: MoodEntry[];
  total: number;
}

export interface MoodPulseDay {
  date: string;
  mood_id: MoodId;
  score: number;
}

export interface WeeklyMoodPulseResponse {
  window: {
    start_date: string;
    end_date: string;
    days: number;
  };
  coverage: {
    logged_days: number;
    missing_days: number;
  };
  current_week: {
    average_score: number | null;
    average_mood_id: MoodId | null;
    days: MoodPulseDay[];
  };
  comparison: {
    previous_average_score: number | null;
    delta_score: number | null;
    direction: MoodPulseDirection;
  };
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
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

    if (body && method === 'POST') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, config);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication expired');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

export const fetchMoodEntries = async (
  startDate?: string,
  endDate?: string,
  limit = 35,
  offset = 0
): Promise<MoodEntriesResponse | null> => {
  try {
    let url = `${API_URL}?limit=${limit}&offset=${offset}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    return await apiRequest<MoodEntriesResponse>(url);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return null;
  }
};

export const saveMoodEntry = async (moodId: MoodId, date: string): Promise<MoodEntry | null> => {
  try {
    return await apiRequest<MoodEntry>(API_URL, 'POST', {
      mood_id: moodId,
      date,
    });
  } catch (error) {
    console.error('Error saving mood entry:', error);
    return null;
  }
};

export const fetchWeeklyMoodPulse = async (
  endDate?: string
): Promise<WeeklyMoodPulseResponse | null> => {
  try {
    let url = `${API_URL}/pulse?window_days=7`;
    if (endDate) {
      url += `&end_date=${endDate}`;
    }

    return await apiRequest<WeeklyMoodPulseResponse>(url);
  } catch (error) {
    console.error('Error fetching weekly mood pulse:', error);
    return null;
  }
};

export const fetchMonthlyMoodPulse = async (
  endDate?: string
): Promise<WeeklyMoodPulseResponse | null> => {
  try {
    let url = `${API_URL}/pulse?window_days=28`;
    if (endDate) {
      url += `&end_date=${endDate}`;
    }

    return await apiRequest<WeeklyMoodPulseResponse>(url);
  } catch (error) {
    console.error('Error fetching monthly mood pulse:', error);
    return null;
  }
};
