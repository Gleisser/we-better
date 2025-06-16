import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getInsightsForComponent,
  generateFreshInsights,
  getInsightStats,
  testInsightsSystem,
  formatInsightsForComponent,
  type InsightGenerationParams,
  type InsightStats,
} from '../api/dreamInsightsApi';

// Component-friendly insight type
export interface ComponentInsight {
  id: string;
  type: 'pattern' | 'balance' | 'progress' | 'suggestion';
  title: string;
  description: string;
  relatedCategories?: string[];
}

export interface UseInsightsReturn {
  insights: ComponentInsight[];
  loading: boolean;
  error: string | null;
  stats: InsightStats | null;
  refreshInsights: (params?: InsightGenerationParams) => Promise<void>;
  generateFresh: (params?: InsightGenerationParams) => Promise<void>;
  clearError: () => void;
  systemHealthy: boolean;
}

/**
 * Hook for managing Dream Insights data
 */
export const useInsights = (initialParams: InsightGenerationParams = {}): UseInsightsReturn => {
  const [insights, setInsights] = useState<ComponentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [systemHealthy, setSystemHealthy] = useState(false);

  // Use ref to track if initial load has been done
  const hasInitiallyLoaded = useRef(false);
  // Store params in ref to avoid dependency issues
  const paramsRef = useRef(initialParams);
  paramsRef.current = initialParams;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchInsights = useCallback(async (fetchParams: InsightGenerationParams = {}) => {
    try {
      setError(null);

      // Use the component-friendly function that handles fallbacks
      const insightsData = await getInsightsForComponent({
        ...paramsRef.current,
        ...fetchParams,
      });

      setInsights(insightsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(errorMessage);

      // Set fallback insights on error
      setInsights([
        {
          id: 'error-fallback',
          type: 'suggestion',
          title: 'Unable to Load Insights',
          description:
            'We encountered an issue loading your insights. Please try refreshing or check your connection.',
          relatedCategories: [],
        },
      ]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getInsightStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch insight stats:', err);
      // Don't set error for stats failure as it's not critical
    }
  }, []);

  const checkSystemHealth = useCallback(async () => {
    try {
      const healthy = await testInsightsSystem();
      setSystemHealthy(healthy);
    } catch (err) {
      console.error('Failed to check system health:', err);
      setSystemHealthy(false);
    }
  }, []);

  const refreshInsights = useCallback(
    async (refreshParams?: InsightGenerationParams) => {
      setLoading(true);
      try {
        // Only fetch insights, skip stats and health checks to reduce API calls
        await fetchInsights(refreshParams);
      } finally {
        setLoading(false);
      }
    },
    [fetchInsights]
  );

  const generateFresh = useCallback(async (freshParams?: InsightGenerationParams) => {
    try {
      setLoading(true);
      setError(null);

      const freshInsights = await generateFreshInsights({
        ...paramsRef.current,
        ...freshParams,
      });

      // Convert to component format
      const componentInsights = formatInsightsForComponent(freshInsights);
      setInsights(componentInsights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate fresh insights';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - only run once
  useEffect(() => {
    if (!hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;

      const initialLoad = async (): Promise<void> => {
        setLoading(true);
        try {
          // Load insights first
          await fetchInsights(paramsRef.current);

          // Load stats and health check in background (non-blocking)
          fetchStats().catch(console.error);
          checkSystemHealth().catch(console.error);
        } finally {
          setLoading(false);
        }
      };

      initialLoad();
    }
  }, [fetchInsights, fetchStats, checkSystemHealth]); // Include stable function dependencies

  return {
    insights,
    loading,
    error,
    stats,
    refreshInsights,
    generateFresh,
    clearError,
    systemHealthy,
  };
};
