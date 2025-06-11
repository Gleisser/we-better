import { useState, useEffect, useCallback } from 'react';
import {
  DreamChallenge,
  CreateDreamChallengeInput,
  UpdateDreamChallengeInput,
  DreamChallengeProgress,
  getActiveChallenges,
  getCompletedChallenges,
  createDreamChallenge,
  updateDreamChallenge,
  deleteDreamChallenge,
  markDayComplete,
  getChallengeProgress,
} from '../api/dreamChallengesApi';

interface UseDreamChallengesResult {
  // State
  challenges: DreamChallenge[];
  activeChallenges: DreamChallenge[];
  completedChallenges: DreamChallenge[];
  loading: boolean;
  error: string | null;

  // Actions
  loadChallenges: () => Promise<void>;
  createChallenge: (data: CreateDreamChallengeInput) => Promise<DreamChallenge | null>;
  updateChallenge: (data: UpdateDreamChallengeInput) => Promise<DreamChallenge | null>;
  deleteChallenge: (id: string) => Promise<boolean>;
  markDayCompleted: (challengeId: string, dayNumber: number, notes?: string) => Promise<void>;
  refreshChallenges: () => Promise<void>;
  getProgressHistory: (challengeId: string) => Promise<DreamChallengeProgress[]>;
}

export const useDreamChallenges = (): UseDreamChallengesResult => {
  const [challenges, setChallenges] = useState<DreamChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<DreamChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<DreamChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all challenges from the API
   */
  const loadChallenges = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Load active and completed challenges in parallel
      const [activeData, completedData] = await Promise.all([
        getActiveChallenges(),
        getCompletedChallenges(),
      ]);

      setActiveChallenges(activeData);
      setCompletedChallenges(completedData);
      setChallenges([...activeData, ...completedData]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load challenges';
      setError(errorMessage);
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new challenge
   */
  const createChallenge = useCallback(
    async (data: CreateDreamChallengeInput): Promise<DreamChallenge | null> => {
      try {
        setLoading(true);
        setError(null);

        const newChallenge = await createDreamChallenge(data);

        if (newChallenge) {
          // Add to active challenges if not completed
          if (!newChallenge.completed) {
            setActiveChallenges(prev => [newChallenge, ...prev]);
          } else {
            setCompletedChallenges(prev => [newChallenge, ...prev]);
          }

          // Update all challenges
          setChallenges(prev => [newChallenge, ...prev]);
        }

        return newChallenge;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create challenge';
        setError(errorMessage);
        console.error('Error creating challenge:', err);
        throw err; // Re-throw for component error handling
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update an existing challenge
   */
  const updateChallenge = useCallback(
    async (data: UpdateDreamChallengeInput): Promise<DreamChallenge | null> => {
      try {
        setLoading(true);
        setError(null);

        const updatedChallenge = await updateDreamChallenge(data);

        if (updatedChallenge) {
          // Update the challenge in all relevant arrays
          const updateChallengeInArray = (prev: DreamChallenge[]): DreamChallenge[] =>
            prev.map(challenge =>
              challenge.id === updatedChallenge.id ? updatedChallenge : challenge
            );

          setChallenges(updateChallengeInArray);

          // Check if completion status changed
          if (updatedChallenge.completed) {
            // Move from active to completed
            setActiveChallenges(prev => prev.filter(c => c.id !== updatedChallenge.id));
            setCompletedChallenges(prev => {
              const exists = prev.some(c => c.id === updatedChallenge.id);
              return exists ? updateChallengeInArray(prev) : [updatedChallenge, ...prev];
            });
          } else {
            // Update in active challenges
            setActiveChallenges(updateChallengeInArray);
            // Remove from completed if it was there
            setCompletedChallenges(prev => prev.filter(c => c.id !== updatedChallenge.id));
          }
        }

        return updatedChallenge;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update challenge';
        setError(errorMessage);
        console.error('Error updating challenge:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete a challenge
   */
  const deleteChallenge = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await deleteDreamChallenge(id);

      if (success) {
        // Remove from all arrays
        const filterById = (prev: DreamChallenge[]): DreamChallenge[] =>
          prev.filter(c => c.id !== id);

        setChallenges(filterById);
        setActiveChallenges(filterById);
        setCompletedChallenges(filterById);
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete challenge';
      setError(errorMessage);
      console.error('Error deleting challenge:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a day as completed for a challenge
   * This properly uses both the progress table and updates the main challenge
   */
  const markDayCompleted = useCallback(
    async (challengeId: string, dayNumber: number, notes?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // First, record the progress in the progress table
        await markDayComplete({
          challenge_id: challengeId,
          day_number: dayNumber,
          notes,
        });

        // Update the challenge's current_day in the main table
        const challenge = [...activeChallenges, ...completedChallenges].find(
          c => c.id === challengeId
        );
        if (challenge) {
          const newCurrentDay = dayNumber;
          const isCompleted = newCurrentDay >= challenge.duration;

          await updateChallenge({
            id: challengeId,
            current_day: newCurrentDay,
            completed: isCompleted,
          });

          // The updateChallenge function already handles moving challenges between
          // active and completed arrays, so no additional logic needed here
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark day completed';
        setError(errorMessage);
        console.error('Error marking day completed:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeChallenges, completedChallenges, updateChallenge]
  );

  /**
   * Get progress history for a specific challenge
   */
  const getProgressHistory = useCallback(
    async (challengeId: string): Promise<DreamChallengeProgress[]> => {
      try {
        return await getChallengeProgress(challengeId);
      } catch (err) {
        console.error('Error getting progress history:', err);
        return [];
      }
    },
    []
  );

  /**
   * Refresh challenges (alias for loadChallenges)
   */
  const refreshChallenges = useCallback(async (): Promise<void> => {
    await loadChallenges();
  }, [loadChallenges]);

  // Load challenges on mount
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  return {
    // State
    challenges,
    activeChallenges,
    completedChallenges,
    loading,
    error,

    // Actions
    loadChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    markDayCompleted,
    refreshChallenges,
    getProgressHistory,
  };
};
