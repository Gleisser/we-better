import { useState, useEffect, useCallback } from 'react';
import { fetchUserProfile, type UserProfile } from '@/core/services/profileService';
import { useAuth } from './useAuth';

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage user profile data
 * Includes avatar_url and other profile information not available in auth context
 */
export const useProfile = (): UseProfileReturn => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchUserProfile();

      if (response?.user) {
        setProfile(response.user);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch profile when user changes or on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
};
