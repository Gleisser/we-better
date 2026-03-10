import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  preferencesService,
  UserPreferences,
  UserPreferencesUpdateRequest,
} from '@/core/services/preferencesService';
import { useAuth } from '@/shared/hooks/useAuth';

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

const userPreferencesQueryKey = (userId: string | null) =>
  ['userPreferences', userId ?? 'anonymous'] as const;

const USER_PREFERENCES_OFFLINE_CACHE_KEY = 'user-preferences-cache';

const loadOfflinePreferences = (): UserPreferences | null => {
  if (typeof window === 'undefined' || navigator.onLine) {
    return null;
  }

  try {
    const cached = localStorage.getItem(USER_PREFERENCES_OFFLINE_CACHE_KEY);
    return cached ? (JSON.parse(cached) as UserPreferences) : null;
  } catch (error) {
    console.error('Failed to load cached preferences from localStorage:', error);
    return null;
  }
};

export function useUserPreferences(): UseUserPreferencesReturn {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    preferencesService.clearCache();
    setManualError(null);
  }, [userId]);

  const query = useQuery({
    queryKey: userPreferencesQueryKey(userId),
    queryFn: async (): Promise<UserPreferences | null> => {
      const result = await preferencesService.getUserPreferences();
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !authLoading && Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: UserPreferencesUpdateRequest): Promise<UserPreferences | null> => {
      const result = await preferencesService.patchUserPreferences(updates);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: data => {
      queryClient.setQueryData(userPreferencesQueryKey(userId), data);
      setManualError(null);
    },
  });

  const offlinePreferences = useMemo(
    () => (!query.data && !query.isLoading ? loadOfflinePreferences() : null),
    [query.data, query.isLoading]
  );

  const preferences = query.data ?? offlinePreferences ?? null;

  useEffect(() => {
    if (!preferences || typeof window === 'undefined' || navigator.onLine) {
      return;
    }

    try {
      localStorage.setItem(USER_PREFERENCES_OFFLINE_CACHE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to cache preferences to localStorage:', error);
    }
  }, [preferences]);

  const updatePreferences = useCallback(
    async (updates: UserPreferencesUpdateRequest): Promise<boolean> => {
      if (!userId) {
        setManualError('Not authenticated');
        return false;
      }

      try {
        await updateMutation.mutateAsync(updates);
        return true;
      } catch (error) {
        setManualError(error instanceof Error ? error.message : 'Failed to update preferences');
        return false;
      }
    },
    [updateMutation, userId]
  );

  const updateThemeMode = useCallback(
    async (mode: UserPreferences['theme_mode']): Promise<boolean> =>
      updatePreferences({ theme_mode: mode }),
    [updatePreferences]
  );

  const updateTimeBasedTheme = useCallback(
    async (enabled: boolean): Promise<boolean> => updatePreferences({ time_based_theme: enabled }),
    [updatePreferences]
  );

  const updateLanguage = useCallback(
    async (language: string): Promise<boolean> => updatePreferences({ language }),
    [updatePreferences]
  );

  const refreshPreferences = useCallback(async (): Promise<void> => {
    if (!userId) {
      preferencesService.clearCache();
      queryClient.setQueryData(userPreferencesQueryKey(userId), null);
      return;
    }

    preferencesService.clearCache();
    await query.refetch();
  }, [query, queryClient, userId]);

  const clearError = useCallback(() => {
    setManualError(null);
  }, []);

  return {
    preferences,
    isLoading: authLoading || query.isLoading || updateMutation.isPending,
    error:
      manualError ||
      (updateMutation.error instanceof Error ? updateMutation.error.message : null) ||
      (query.error instanceof Error ? query.error.message : null),
    updatePreferences,
    updateThemeMode,
    updateTimeBasedTheme,
    updateLanguage,
    refreshPreferences,
    clearError,
  };
}

export default useUserPreferences;
