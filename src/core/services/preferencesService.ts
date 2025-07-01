import { supabase } from './supabaseClient';

// Define the API URL - following the same pattern as dream board and life wheel
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/preferences`;

// User Preferences Types (mirroring backend types)
export interface UserPreferences {
  id?: string;
  user_id?: string;
  theme_mode: 'light' | 'dark' | 'auto';
  time_based_theme: boolean;
  language: string;
  font_size: 'small' | 'medium' | 'large';
  reduced_motion: boolean;
  high_contrast: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferencesUpdateRequest {
  theme_mode?: 'light' | 'dark' | 'auto';
  time_based_theme?: boolean;
  language?: string;
  font_size?: 'small' | 'medium' | 'large';
  reduced_motion?: boolean;
  high_contrast?: boolean;
}

export interface UserPreferencesResponse {
  preferences: UserPreferences;
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
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: Record<string, unknown> | UserPreferencesUpdateRequest
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

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
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
 * Frontend service for managing user preferences
 */
export class PreferencesService {
  private static instance: PreferencesService;
  private cache: UserPreferences | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  /**
   * Get user preferences from API
   */
  async getUserPreferences(): Promise<{ data: UserPreferences | null; error: string | null }> {
    try {
      // Check cache first
      if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_TTL) {
        return { data: this.cache, error: null };
      }

      const response = await apiRequest<UserPreferencesResponse>(API_URL);

      if (response?.preferences) {
        // Update cache
        this.cache = response.preferences;
        this.cacheTimestamp = Date.now();
        return { data: response.preferences, error: null };
      } else {
        return { data: null, error: 'No preferences found' };
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update user preferences via API
   */
  async updateUserPreferences(
    preferences: UserPreferencesUpdateRequest
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    try {
      const response = await apiRequest<UserPreferencesResponse>(API_URL, 'PUT', preferences);

      if (response?.preferences) {
        // Update cache
        this.cache = response.preferences;
        this.cacheTimestamp = Date.now();
        return { data: response.preferences, error: null };
      } else {
        return { data: null, error: 'Failed to update preferences' };
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Partially update user preferences via API
   */
  async patchUserPreferences(
    preferences: Partial<UserPreferencesUpdateRequest>
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    try {
      const response = await apiRequest<UserPreferencesResponse>(API_URL, 'PATCH', preferences);

      if (response?.preferences) {
        // Update cache
        this.cache = response.preferences;
        this.cacheTimestamp = Date.now();
        return { data: response.preferences, error: null };
      } else {
        return { data: null, error: 'Failed to update preferences' };
      }
    } catch (error) {
      console.error('Error patching user preferences:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update theme mode only
   */
  async updateThemeMode(
    themeMode: UserPreferences['theme_mode']
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    return this.patchUserPreferences({ theme_mode: themeMode });
  }

  /**
   * Update time-based theme preference
   */
  async updateTimeBasedTheme(
    timeBasedTheme: boolean
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    return this.patchUserPreferences({ time_based_theme: timeBasedTheme });
  }

  /**
   * Update language preference
   */
  async updateLanguage(
    language: string
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    return this.patchUserPreferences({ language });
  }

  /**
   * Update font size preference
   */
  async updateFontSize(
    fontSize: UserPreferences['font_size']
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    return this.patchUserPreferences({ font_size: fontSize });
  }

  /**
   * Update accessibility preferences
   */
  async updateAccessibilitySettings(settings: {
    reduced_motion?: boolean;
    high_contrast?: boolean;
  }): Promise<{ data: UserPreferences | null; error: string | null }> {
    return this.patchUserPreferences(settings);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cached preferences if available
   */
  getCachedPreferences(): UserPreferences | null {
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_TTL) {
      return this.cache;
    }
    return null;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    return this.cache !== null && Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  /**
   * Refresh preferences from API (bypass cache)
   */
  async refreshPreferences(): Promise<{ data: UserPreferences | null; error: string | null }> {
    this.clearCache();
    return this.getUserPreferences();
  }
}

// Export singleton instance
export const preferencesService = PreferencesService.getInstance();

// Export default for easy importing
export default preferencesService;
