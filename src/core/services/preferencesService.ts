import { supabase } from './supabaseClient';

// Define the API URLs - following the same pattern as dream board and life wheel
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/preferences`;
const SETTINGS_API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/settings`;

// Notification Settings Types (frontend interface)
export interface NotificationSettings {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  email_goals_reminders: boolean;
  email_habits_reminders: boolean;
  email_weekly_insights: boolean;
  email_milestone_achievements: boolean;
  email_marketing: boolean;
  push_goals_reminders: boolean;
  push_habits_reminders: boolean;
  push_daily_affirmations: boolean;
  push_milestone_achievements: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationSettingsUpdateRequest {
  email_notifications?: boolean;
  push_notifications?: boolean;
  email_goals_reminders?: boolean;
  email_habits_reminders?: boolean;
  email_weekly_insights?: boolean;
  email_milestone_achievements?: boolean;
  email_marketing?: boolean;
  push_goals_reminders?: boolean;
  push_habits_reminders?: boolean;
  push_daily_affirmations?: boolean;
  push_milestone_achievements?: boolean;
}

export interface NotificationSettingsResponse {
  settings: NotificationSettings;
}

// Privacy Settings Types (frontend interface)
export interface PrivacySettings {
  id?: string;
  user_id?: string;
  profile_visibility: boolean;
  search_indexing: boolean;
  analytics_opt_out: boolean;
  marketing_communications: boolean;
  functional_cookies: boolean;
  analytics_cookies: boolean;
  marketing_cookies: boolean;
  cookie_consent_date?: string;
  privacy_policy_accepted_version?: string;
  privacy_policy_accepted_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PrivacySettingsUpdateRequest {
  profile_visibility?: boolean;
  search_indexing?: boolean;
  analytics_opt_out?: boolean;
  marketing_communications?: boolean;
  functional_cookies?: boolean;
  analytics_cookies?: boolean;
  marketing_cookies?: boolean;
  privacy_policy_accepted_version?: string;
}

export interface PrivacySettingsResponse {
  settings: PrivacySettings;
}

export interface CookieConsentUpdateRequest {
  functional_cookies?: boolean;
  analytics_cookies?: boolean;
  marketing_cookies?: boolean;
}

export interface PrivacyPolicyAcceptanceRequest {
  privacy_policy_accepted_version: string;
}

// Combined Settings Interface
export interface AllUserSettings {
  preferences: UserPreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

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
  body?:
    | UserPreferencesUpdateRequest
    | NotificationSettingsUpdateRequest
    | PrivacySettingsUpdateRequest
    | CookieConsentUpdateRequest
    | PrivacyPolicyAcceptanceRequest
    | Record<string, unknown>
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
  private notificationCache: NotificationSettings | null = null;
  private notificationCacheTimestamp: number = 0;
  private privacyCache: PrivacySettings | null = null;
  private privacyCacheTimestamp: number = 0;
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

  // NOTIFICATION SETTINGS METHODS

  /**
   * Get notification settings from API
   */
  async getNotificationSettings(): Promise<{
    data: NotificationSettings | null;
    error: string | null;
  }> {
    try {
      // Check cache first
      if (this.notificationCache && Date.now() - this.notificationCacheTimestamp < this.CACHE_TTL) {
        return { data: this.notificationCache, error: null };
      }

      const response = await apiRequest<NotificationSettingsResponse>(
        `${SETTINGS_API_URL}/notifications`
      );

      if (response?.settings) {
        // Update cache
        this.notificationCache = response.settings;
        this.notificationCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'No notification settings found' };
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update notification settings via API
   */
  async updateNotificationSettings(
    settings: NotificationSettingsUpdateRequest
  ): Promise<{ data: NotificationSettings | null; error: string | null }> {
    try {
      const response = await apiRequest<NotificationSettingsResponse>(
        `${SETTINGS_API_URL}/notifications`,
        'PUT',
        settings
      );

      if (response?.settings) {
        // Update cache
        this.notificationCache = response.settings;
        this.notificationCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'Failed to update notification settings' };
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Partially update notification settings via API
   */
  async patchNotificationSettings(
    settings: Partial<NotificationSettingsUpdateRequest>
  ): Promise<{ data: NotificationSettings | null; error: string | null }> {
    try {
      const response = await apiRequest<NotificationSettingsResponse>(
        `${SETTINGS_API_URL}/notifications`,
        'PATCH',
        settings
      );

      if (response?.settings) {
        // Update cache
        this.notificationCache = response.settings;
        this.notificationCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'Failed to update notification settings' };
      }
    } catch (error) {
      console.error('Error patching notification settings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // PRIVACY SETTINGS METHODS

  /**
   * Get privacy settings from API
   */
  async getPrivacySettings(): Promise<{ data: PrivacySettings | null; error: string | null }> {
    try {
      // Check cache first
      if (this.privacyCache && Date.now() - this.privacyCacheTimestamp < this.CACHE_TTL) {
        return { data: this.privacyCache, error: null };
      }

      const response = await apiRequest<PrivacySettingsResponse>(`${SETTINGS_API_URL}/privacy`);

      if (response?.settings) {
        // Update cache
        this.privacyCache = response.settings;
        this.privacyCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'No privacy settings found' };
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update privacy settings via API
   */
  async updatePrivacySettings(
    settings: PrivacySettingsUpdateRequest
  ): Promise<{ data: PrivacySettings | null; error: string | null }> {
    try {
      const response = await apiRequest<PrivacySettingsResponse>(
        `${SETTINGS_API_URL}/privacy`,
        'PUT',
        settings
      );

      if (response?.settings) {
        // Update cache
        this.privacyCache = response.settings;
        this.privacyCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'Failed to update privacy settings' };
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update cookie consent settings
   */
  async updateCookieConsent(
    settings: CookieConsentUpdateRequest
  ): Promise<{ data: PrivacySettings | null; error: string | null }> {
    try {
      const response = await apiRequest<PrivacySettingsResponse>(
        `${SETTINGS_API_URL}/privacy/cookies`,
        'PUT',
        settings
      );

      if (response?.settings) {
        // Update cache
        this.privacyCache = response.settings;
        this.privacyCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'Failed to update cookie consent' };
      }
    } catch (error) {
      console.error('Error updating cookie consent:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Accept privacy policy
   */
  async acceptPrivacyPolicy(
    acceptance: PrivacyPolicyAcceptanceRequest
  ): Promise<{ data: PrivacySettings | null; error: string | null }> {
    try {
      const response = await apiRequest<PrivacySettingsResponse>(
        `${SETTINGS_API_URL}/privacy/policy`,
        'POST',
        acceptance
      );

      if (response?.settings) {
        // Update cache
        this.privacyCache = response.settings;
        this.privacyCacheTimestamp = Date.now();
        return { data: response.settings, error: null };
      } else {
        return { data: null, error: 'Failed to accept privacy policy' };
      }
    } catch (error) {
      console.error('Error accepting privacy policy:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // COMBINED SETTINGS METHODS

  /**
   * Get all user settings (preferences, notifications, privacy)
   */
  async getAllSettings(): Promise<{ data: AllUserSettings | null; error: string | null }> {
    try {
      const [preferencesResult, notificationsResult, privacyResult] = await Promise.all([
        this.getUserPreferences(),
        this.getNotificationSettings(),
        this.getPrivacySettings(),
      ]);

      if (preferencesResult.error || notificationsResult.error || privacyResult.error) {
        const errors = [
          preferencesResult.error,
          notificationsResult.error,
          privacyResult.error,
        ].filter(Boolean);
        return { data: null, error: errors.join(', ') };
      }

      if (!preferencesResult.data || !notificationsResult.data || !privacyResult.data) {
        return { data: null, error: 'Some settings could not be loaded' };
      }

      return {
        data: {
          preferences: preferencesResult.data,
          notifications: notificationsResult.data,
          privacy: privacyResult.data,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching all settings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    this.notificationCache = null;
    this.notificationCacheTimestamp = 0;
    this.privacyCache = null;
    this.privacyCacheTimestamp = 0;
  }

  /**
   * Refresh all settings from API (bypass cache)
   */
  async refreshAllSettings(): Promise<{ data: AllUserSettings | null; error: string | null }> {
    this.clearAllCaches();
    return this.getAllSettings();
  }
}

// Export singleton instance
export const preferencesService = PreferencesService.getInstance();

// Export default for easy importing
export default preferencesService;
