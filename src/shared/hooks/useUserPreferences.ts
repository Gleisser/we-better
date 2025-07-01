import { useState, useEffect, useCallback } from 'react';
import {
  preferencesService,
  UserPreferences,
  UserPreferencesUpdateRequest,
} from '@/core/services/preferencesService';

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (updates: UserPreferencesUpdateRequest) => Promise<boolean>;
  updateThemeMode: (mode: UserPreferences['theme_mode']) => Promise<boolean>;
  updateTimeBasedTheme: (enabled: boolean) => Promise<boolean>;
  updateLanguage: (language: string) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing user preferences with API integration
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load preferences from API
   */
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: apiError } = await preferencesService.getUserPreferences();

      if (apiError) {
        setError(apiError);
      } else {
        setPreferences(data);
      }
    } catch (err) {
      setError('Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update preferences via API
   */
  const updatePreferences = useCallback(
    async (updates: UserPreferencesUpdateRequest): Promise<boolean> => {
      try {
        setError(null);

        const { data, error: apiError } = await preferencesService.patchUserPreferences(updates);

        if (apiError) {
          setError(apiError);
          return false;
        }

        if (data) {
          setPreferences(data);
        }

        return true;
      } catch (err) {
        setError('Failed to update preferences');
        console.error('Error updating preferences:', err);
        return false;
      }
    },
    []
  );

  /**
   * Update theme mode specifically
   */
  const updateThemeMode = useCallback(
    async (mode: UserPreferences['theme_mode']): Promise<boolean> => {
      return updatePreferences({ theme_mode: mode });
    },
    [updatePreferences]
  );

  /**
   * Update time-based theme preference
   */
  const updateTimeBasedTheme = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      return updatePreferences({ time_based_theme: enabled });
    },
    [updatePreferences]
  );

  /**
   * Update language preference
   */
  const updateLanguage = useCallback(
    async (language: string): Promise<boolean> => {
      return updatePreferences({ language });
    },
    [updatePreferences]
  );

  /**
   * Refresh preferences from API
   */
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle online/offline sync
   */
  useEffect(() => {
    const handleOnline = (): void => {
      // When coming back online, refresh preferences
      loadPreferences();
    };

    const handleOffline = (): void => {
      // When going offline, we'll rely on cached data
      console.info('Going offline - using cached preferences');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPreferences]);

  /**
   * Load preferences on mount
   */
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  /**
   * Sync with localStorage as fallback when offline
   */
  useEffect(() => {
    if (preferences && !navigator.onLine) {
      try {
        localStorage.setItem('user-preferences-cache', JSON.stringify(preferences));
      } catch (err) {
        console.error('Failed to cache preferences to localStorage:', err);
      }
    }
  }, [preferences]);

  /**
   * Load from localStorage when offline and no preferences loaded
   */
  useEffect(() => {
    if (!preferences && !navigator.onLine && !isLoading) {
      try {
        const cached = localStorage.getItem('user-preferences-cache');
        if (cached) {
          const cachedPreferences = JSON.parse(cached);
          setPreferences(cachedPreferences);
        }
      } catch (err) {
        console.error('Failed to load cached preferences from localStorage:', err);
      }
    }
  }, [preferences, isLoading]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    updateThemeMode,
    updateTimeBasedTheme,
    updateLanguage,
    refreshPreferences,
    clearError,
  };
}

export default useUserPreferences;
