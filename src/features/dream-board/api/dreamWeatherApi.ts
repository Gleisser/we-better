import { supabase } from '@/core/services/supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/dream-weather`;

// Types for dream weather
export type WeatherState = 'sunny' | 'cloudy' | 'stormy' | 'raining';

export interface WeatherMetrics {
  progressTrend: number; // Average progress change over period (-1 to 1)
  consistencyScore: number; // Consistency in completing activities (0 to 1)
  recentActivity: number; // Recent milestone/challenge activity score (0 to 1)
  goalCompletion: number; // Goal completion rate (0 to 1)
}

export interface CategoryWeatherStatus {
  [category: string]: WeatherState;
}

export interface DreamWeatherResponse {
  overall: WeatherState;
  categoryStatus: CategoryWeatherStatus;
  message: string;
  metrics?: WeatherMetrics;
  calculatedAt: string;
  refreshed?: boolean; // Only present when manually refreshed
}

export interface DreamWeatherParams {
  includeMetrics?: boolean;
  includeCategoryStatus?: boolean;
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

/**
 * Get current dream weather status for the authenticated user
 */
export const getDreamWeather = async (
  params: DreamWeatherParams = {}
): Promise<DreamWeatherResponse | null> => {
  try {
    const { includeMetrics = false, includeCategoryStatus = true } = params;

    const searchParams = new URLSearchParams();

    if (includeMetrics) {
      searchParams.append('include_metrics', 'true');
    }

    if (!includeCategoryStatus) {
      searchParams.append('include_category_status', 'false');
    }

    const url = searchParams.toString() ? `${API_URL}?${searchParams}` : API_URL;
    return await apiRequest<DreamWeatherResponse>(url);
  } catch (error) {
    console.error('Error getting dream weather:', error);
    return null;
  }
};

/**
 * Force refresh dream weather calculation
 */
export const refreshDreamWeather = async (): Promise<DreamWeatherResponse | null> => {
  try {
    return await apiRequest<DreamWeatherResponse>(API_URL, 'POST');
  } catch (error) {
    console.error('Error refreshing dream weather:', error);
    return null;
  }
};

/**
 * Get weather status with detailed metrics included
 */
export const getDreamWeatherWithMetrics = async (): Promise<DreamWeatherResponse | null> => {
  return getDreamWeather({ includeMetrics: true, includeCategoryStatus: true });
};

/**
 * Get simple weather status without category breakdown
 */
export const getSimpleDreamWeather = async (): Promise<DreamWeatherResponse | null> => {
  return getDreamWeather({ includeMetrics: false, includeCategoryStatus: false });
};
