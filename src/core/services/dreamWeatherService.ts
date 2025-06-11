import { supabase } from './supabaseClient';

// Update the API URL to point to the actual backend server
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
 * Get current dream weather status for the authenticated user
 * @param params Optional parameters for customizing the response
 * @returns Dream weather data or null if error
 */
export const getDreamWeather = async (
  params: DreamWeatherParams = {}
): Promise<DreamWeatherResponse | null> => {
  try {
    const { includeMetrics = false, includeCategoryStatus = true } = params;

    let url = API_URL;
    const searchParams = new URLSearchParams();

    if (includeMetrics) {
      searchParams.append('include_metrics', 'true');
    }

    if (!includeCategoryStatus) {
      searchParams.append('include_category_status', 'false');
    }

    if (searchParams.toString()) {
      url += `?${searchParams}`;
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
      throw new Error(`Error getting dream weather: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting dream weather:', error);
    return null;
  }
};

/**
 * Force refresh dream weather calculation
 * @returns Updated dream weather data or null if error
 */
export const refreshDreamWeather = async (): Promise<DreamWeatherResponse | null> => {
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
    });

    if (!response.ok) {
      throw new Error(`Error refreshing dream weather: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing dream weather:', error);
    return null;
  }
};

/**
 * Get weather status with detailed metrics included
 * @returns Dream weather data with metrics or null if error
 */
export const getDreamWeatherWithMetrics = async (): Promise<DreamWeatherResponse | null> => {
  return getDreamWeather({ includeMetrics: true, includeCategoryStatus: true });
};

/**
 * Get simple weather status without category breakdown
 * @returns Dream weather data without category details or null if error
 */
export const getSimpleDreamWeather = async (): Promise<DreamWeatherResponse | null> => {
  return getDreamWeather({ includeMetrics: false, includeCategoryStatus: false });
};
