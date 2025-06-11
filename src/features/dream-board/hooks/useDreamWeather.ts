import { useState, useEffect, useCallback } from 'react';
import {
  getDreamWeather,
  refreshDreamWeather,
  DreamWeatherResponse,
  DreamWeatherParams,
} from '../api/dreamWeatherApi';

export interface UseDreamWeatherOptions {
  includeMetrics?: boolean;
  includeCategoryStatus?: boolean;
  autoFetch?: boolean; // Whether to fetch weather on mount
  refreshInterval?: number; // Auto-refresh interval in milliseconds
}

export interface UseDreamWeatherReturn {
  weather: DreamWeatherResponse | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (params?: DreamWeatherParams) => Promise<void>;
  refreshWeather: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Hook for managing dream weather data
 */
export const useDreamWeather = (options: UseDreamWeatherOptions = {}): UseDreamWeatherReturn => {
  const {
    includeMetrics = false,
    includeCategoryStatus = true,
    autoFetch = true,
    refreshInterval,
  } = options;

  const [weather, setWeather] = useState<DreamWeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Fetch weather data from the API
   */
  const fetchWeather = useCallback(
    async (params?: DreamWeatherParams) => {
      try {
        setLoading(true);
        setError(null);

        const fetchParams = params || { includeMetrics, includeCategoryStatus };
        const weatherData = await getDreamWeather(fetchParams);

        if (weatherData) {
          setWeather(weatherData);
          setLastUpdated(new Date());
        } else {
          setError('Failed to fetch dream weather data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching dream weather:', err);
      } finally {
        setLoading(false);
      }
    },
    [includeMetrics, includeCategoryStatus]
  );

  /**
   * Force refresh weather calculation
   */
  const refreshWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const weatherData = await refreshDreamWeather();

      if (weatherData) {
        setWeather(weatherData);
        setLastUpdated(new Date());
      } else {
        setError('Failed to refresh dream weather data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error refreshing dream weather:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch weather on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchWeather();
    }
  }, [autoFetch, fetchWeather]);

  // Set up auto-refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchWeather();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchWeather]);

  return {
    weather,
    loading,
    error,
    fetchWeather,
    refreshWeather,
    lastUpdated,
  };
};

/**
 * Hook specifically for weather with metrics
 */
export const useDreamWeatherWithMetrics = (
  options: Omit<UseDreamWeatherOptions, 'includeMetrics'> = {}
): UseDreamWeatherReturn => {
  return useDreamWeather({ ...options, includeMetrics: true });
};

/**
 * Hook for simple weather without category breakdown
 */
export const useSimpleDreamWeather = (
  options: Omit<UseDreamWeatherOptions, 'includeCategoryStatus'> = {}
): UseDreamWeatherReturn => {
  return useDreamWeather({ ...options, includeCategoryStatus: false });
};
