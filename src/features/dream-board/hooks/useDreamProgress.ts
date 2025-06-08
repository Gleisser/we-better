import { useState, useCallback } from 'react';
import { adjustDreamProgress, getLatestDreamProgress } from '@/core/services/dreamProgressService';
import type {
  AdjustProgressParams,
  AdjustProgressResponse,
  LatestDreamProgress,
} from '@/core/services/dreamProgressService';
import type { Dream } from '../types';

interface UseDreamProgressReturn {
  updateDreamProgress: (
    dreamId: string,
    adjustment: number,
    dream: Dream
  ) => Promise<number | null>;
  getProgressForDream: (dreamId: string) => Promise<number>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing dream progress
 * Integrates the QuickVision component with the backend progress tracking
 */
export const useDreamProgress = (): UseDreamProgressReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update dream progress by adjustment value (for +/- buttons in QuickVision)
   * @param dreamId The dream board content ID
   * @param adjustment The adjustment value (+0.1 or -0.1)
   * @param dream The dream object for metadata
   * @returns The new progress value or null if error
   */
  const updateDreamProgress = useCallback(
    async (dreamId: string, adjustment: number, dream: Dream): Promise<number | null> => {
      setLoading(true);
      setError(null);

      try {
        const params: AdjustProgressParams = {
          dream_id: dreamId,
          dream_title: dream.title,
          dream_category: dream.category,
          adjustment: adjustment,
        };

        const response: AdjustProgressResponse | null = await adjustDreamProgress(params);

        if (response && response.success) {
          return response.new_progress;
        } else {
          throw new Error('Failed to update dream progress');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error updating dream progress:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get the current progress for a specific dream
   * @param dreamId The dream board content ID
   * @returns The current progress value (0-1)
   */
  const getProgressForDream = useCallback(async (dreamId: string): Promise<number> => {
    try {
      const latestProgress: LatestDreamProgress[] = await getLatestDreamProgress(dreamId);

      if (latestProgress && latestProgress.length > 0) {
        return latestProgress[0].progress_value;
      }

      // Return 0 if no progress found
      return 0;
    } catch (err) {
      console.error('Error getting dream progress:', err);
      return 0;
    }
  }, []);

  return {
    updateDreamProgress,
    getProgressForDream,
    loading,
    error,
  };
};
