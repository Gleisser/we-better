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

      const response = await fetch('/api/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to fetch preferences' };
      }

      const data: UserPreferencesResponse = await response.json();

      // Update cache
      this.cache = data.preferences;
      this.cacheTimestamp = Date.now();

      return { data: data.preferences, error: null };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { data: null, error: 'Network error' };
    }
  }

  /**
   * Update user preferences via API
   */
  async updateUserPreferences(
    preferences: UserPreferencesUpdateRequest
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to update preferences' };
      }

      const data = await response.json();

      // Update cache
      this.cache = data.preferences;
      this.cacheTimestamp = Date.now();

      return { data: data.preferences, error: null };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return { data: null, error: 'Network error' };
    }
  }

  /**
   * Partially update user preferences via API
   */
  async patchUserPreferences(
    preferences: Partial<UserPreferencesUpdateRequest>
  ): Promise<{ data: UserPreferences | null; error: string | null }> {
    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to update preferences' };
      }

      const data = await response.json();

      // Update cache
      this.cache = data.preferences;
      this.cacheTimestamp = Date.now();

      return { data: data.preferences, error: null };
    } catch (error) {
      console.error('Error patching user preferences:', error);
      return { data: null, error: 'Network error' };
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
   * Get cached preferences without API call
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
   * Force refresh preferences from API
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
