import { createContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/core/services/authService';
import { supabase } from '@/core/services/supabaseClient';
import { sessionsService } from '@/core/services/sessionsService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Represents an authenticated user in the application.
 * @interface User
 * @property {string} id - The unique identifier of the user
 * @property {string} email - The user's email address
 * @property {string} [full_name] - The user's full name (optional)
 * @property {string} [display_name] - The user's display name from metadata (optional)
 * @property {Record<string, unknown>} [user_metadata] - The user's metadata (optional)
 */
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  user_metadata?: Record<string, unknown>;
}

/**
 * Authentication context type definition containing user state and auth methods.
 * @interface AuthContextType
 * @property {User | null} user - The current authenticated user or null if not authenticated
 * @property {boolean} isLoading - Indicates if auth operations are in progress
 * @property {boolean} isAuthenticated - Indicates if a user is currently authenticated
 * @property {() => Promise<void>} checkAuth - Function to verify current authentication status
 * @property {() => Promise<void>} logout - Function to sign out the current user
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Context object for managing authentication state across the application.
 * Provides default values when accessed outside of AuthProvider.
 */
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  checkAuth: async () => {},
  logout: async () => {},
});

/**
 * Authentication Provider component that manages user authentication state.
 * Handles user session persistence, auth state changes, and provides auth-related functions.
 *
 * Features:
 * - Automatic session persistence
 * - Real-time auth state synchronization
 * - Loading state management
 * - Centralized auth error handling
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getMetadataString = (
    metadata: SupabaseUser['user_metadata'] | undefined,
    key: string
  ): string | undefined => {
    const value = metadata?.[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  };

  const trackCurrentSessionSilently = useCallback(async () => {
    const { error } = await sessionsService.trackCurrentSession();
    if (error) {
      console.warn('Session tracking warning:', error);
    }
  }, []);

  /**
   * Verifies the current authentication status and updates the user state.
   * Handles error cases and updates loading state appropriately.
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const { user: currentUser, error } = await authService.getCurrentUser();

      if (error) {
        console.error('Auth check error:', error);
        setUser(null);
        return;
      }

      if (currentUser) {
        const supabaseUser = currentUser as SupabaseUser;
        const metadataFullName = getMetadataString(supabaseUser.user_metadata, 'full_name');
        const metadataDisplayName = getMetadataString(supabaseUser.user_metadata, 'display_name');
        const metadataAvatarUrl = getMetadataString(supabaseUser.user_metadata, 'avatar_url');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (profileError) {
          console.warn('Profile lookup warning:', profileError.message);
        }

        const resolvedFullName = metadataFullName || profileData?.full_name || '';
        const resolvedAvatarUrl = metadataAvatarUrl || profileData?.avatar_url || undefined;
        const resolvedDisplayName = metadataDisplayName || resolvedFullName;

        const userWithDisplayName: User = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: resolvedFullName || undefined,
          display_name: resolvedDisplayName || undefined,
          avatar_url: resolvedAvatarUrl,
          user_metadata: {
            ...(supabaseUser.user_metadata || {}),
            ...(resolvedFullName
              ? { full_name: resolvedFullName, display_name: resolvedDisplayName }
              : {}),
            ...(resolvedAvatarUrl ? { avatar_url: resolvedAvatarUrl } : {}),
          },
        };

        setUser(userWithDisplayName);
        void trackCurrentSessionSilently();
      } else {
        console.warn('No valid user session found');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [trackCurrentSessionSilently]);

  /**
   * Signs out the current user and redirects to the login page.
   * Handles the complete logout flow including state cleanup.
   *
   * @throws {Error} If the sign-out operation fails
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      window.location.href = '/auth/login'; // Use consistent navigation
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect hook to initialize auth state and set up real-time auth listeners.
   * Subscribes to Supabase auth state changes and keeps local state in sync.
   */
  useEffect(() => {
    checkAuth();

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuth();
      } else if (event === 'USER_UPDATED' && session) {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;

    const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
    const intervalId = window.setInterval(() => {
      void trackCurrentSessionSilently();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user, trackCurrentSessionSilently]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
