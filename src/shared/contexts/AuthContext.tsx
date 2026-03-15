import { createContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { appShellService } from '@/core/services/appShellService';
import { authService } from '@/core/services/authService';
import { notificationsService } from '@/core/services/notificationsService';
import { supabase } from '@/core/services/supabaseClient';
import { sessionsService } from '@/core/services/sessionsService';
import { clearAuthScopedQueries } from '@/core/config/react-query';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

type IdleCallbackHandle = number;

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

const AUTH_STORAGE_KEY = 'we-better-auth-token';

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
  isAuthResolved?: boolean;
  isLoggingOut?: boolean;
  unreadNotificationCount?: number;
  checkAuth: () => Promise<void>;
  refreshUnreadNotificationCount?: () => Promise<number>;
  decrementUnreadNotificationCount?: (amount?: number) => void;
  clearUnreadNotificationCount?: () => void;
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
  isAuthResolved: false,
  isLoggingOut: false,
  unreadNotificationCount: 0,
  checkAuth: async () => {},
  refreshUnreadNotificationCount: async () => 0,
  decrementUnreadNotificationCount: () => {},
  clearUnreadNotificationCount: () => {},
  logout: async () => {},
});

interface CachedAuthSnapshot {
  accessToken: string | null;
  user: User | null;
}

const readCachedAuthSnapshot = (): CachedAuthSnapshot => {
  try {
    const rawValue =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return { accessToken: null, user: null };
    }

    const parsed = JSON.parse(rawValue) as {
      access_token?: string;
      user?: {
        id?: string;
        email?: string;
        user_metadata?: Record<string, unknown>;
      };
    };

    if (!parsed.user?.id) {
      return { accessToken: null, user: null };
    }

    const metadata = parsed.user.user_metadata ?? {};
    const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : undefined;
    const displayName =
      typeof metadata.display_name === 'string'
        ? metadata.display_name
        : fullName || parsed.user.email?.split('@')[0];
    const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined;

    return {
      accessToken: parsed.access_token ?? null,
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        full_name: fullName,
        display_name: displayName,
        avatar_url: avatarUrl,
        user_metadata: metadata,
      },
    };
  } catch (error) {
    console.warn('Cached auth snapshot parse warning:', error);
    return { accessToken: null, user: null };
  }
};

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
  const initialAuthSnapshotRef = useRef<CachedAuthSnapshot>(readCachedAuthSnapshot());
  const [user, setUser] = useState<User | null>(initialAuthSnapshotRef.current.user);
  const [isLoading, setIsLoading] = useState(!initialAuthSnapshotRef.current.user);
  const [isAuthResolved, setIsAuthResolved] = useState(
    Boolean(initialAuthSnapshotRef.current.user)
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [sessionAccessToken, setSessionAccessToken] = useState<string | null>(
    initialAuthSnapshotRef.current.accessToken
  );
  const previousUserIdRef = useRef<string | null>(null);
  const trackedSessionKeyRef = useRef<string | null>(null);
  const hydratedSessionKeyRef = useRef<string | null>(null);
  const awaitingInitialSessionRef = useRef(true);
  const initialResolutionTimerRef = useRef<number | null>(null);
  const initialResolutionSettledRef = useRef(Boolean(initialAuthSnapshotRef.current.user));

  const getMetadataString = useCallback(
    (metadata: SupabaseUser['user_metadata'] | undefined, key: string): string | undefined => {
      const value = metadata?.[key];
      return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
    },
    []
  );

  const trackCurrentSessionSilently = useCallback(async () => {
    const { error } = await sessionsService.trackCurrentSession();
    if (error) {
      console.warn('Session tracking warning:', error);
    }
  }, []);

  const buildResolvedUser = useCallback(
    (
      supabaseUser: SupabaseUser,
      profileData?: { full_name?: string | null; avatar_url?: string | null } | null
    ): User => {
      const metadataFullName = getMetadataString(supabaseUser.user_metadata, 'full_name');
      const metadataDisplayName = getMetadataString(supabaseUser.user_metadata, 'display_name');
      const metadataAvatarUrl = getMetadataString(supabaseUser.user_metadata, 'avatar_url');
      const resolvedFullName = metadataFullName || profileData?.full_name || '';
      const resolvedAvatarUrl = metadataAvatarUrl || profileData?.avatar_url || undefined;
      const resolvedDisplayName = metadataDisplayName || resolvedFullName;

      return {
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
    },
    [getMetadataString]
  );

  const refreshUnreadNotificationCount = useCallback(async (): Promise<number> => {
    const { data, error } = await notificationsService.getUnreadCount();

    if (error) {
      console.warn('Unread notifications lookup warning:', error);
      return 0;
    }

    const nextUnreadCount = data?.unread ?? 0;
    setUnreadNotificationCount(nextUnreadCount);
    return nextUnreadCount;
  }, []);

  const decrementUnreadNotificationCount = useCallback((amount = 1): void => {
    setUnreadNotificationCount(currentCount => Math.max(0, currentCount - amount));
  }, []);

  const clearUnreadNotificationCount = useCallback((): void => {
    setUnreadNotificationCount(0);
  }, []);

  const clearInitialResolutionTimer = useCallback(() => {
    if (initialResolutionTimerRef.current !== null) {
      window.clearTimeout(initialResolutionTimerRef.current);
      initialResolutionTimerRef.current = null;
    }
  }, []);

  const resolveInitialAuth = useCallback(() => {
    clearInitialResolutionTimer();
    if (!initialResolutionSettledRef.current) {
      initialResolutionSettledRef.current = true;
      setIsAuthResolved(true);
    }
    setIsLoading(false);
  }, [clearInitialResolutionTimer]);

  const clearAuthenticatedState = useCallback(() => {
    hydratedSessionKeyRef.current = null;
    trackedSessionKeyRef.current = null;
    setSessionAccessToken(null);
    clearUnreadNotificationCount();
    setUser(null);
  }, [clearUnreadNotificationCount]);

  const scheduleAnonymousResolution = useCallback(() => {
    if (initialResolutionSettledRef.current) {
      setIsLoading(false);
      return;
    }

    clearInitialResolutionTimer();
    initialResolutionTimerRef.current = window.setTimeout(() => {
      clearAuthenticatedState();
      initialResolutionSettledRef.current = true;
      setIsAuthResolved(true);
      setIsLoading(false);
      initialResolutionTimerRef.current = null;
    }, 1200);
  }, [clearAuthenticatedState, clearInitialResolutionTimer]);

  const hydrateUserFromSession = useCallback(
    async (session: Session | null, options?: { force?: boolean }) => {
      if (!session?.user) {
        clearAuthenticatedState();
        return;
      }

      const sessionKey = `${session.user.id}:${session.access_token ?? 'no-token'}`;
      if (!options?.force && hydratedSessionKeyRef.current === sessionKey) {
        setSessionAccessToken(session.access_token ?? null);
        return;
      }

      hydratedSessionKeyRef.current = sessionKey;
      setSessionAccessToken(session.access_token ?? null);

      try {
        const supabaseUser = session.user as SupabaseUser;

        const bootstrapResult = await appShellService.getBootstrap(
          session.access_token ?? undefined
        );

        if (bootstrapResult.error) {
          console.warn('App shell bootstrap warning:', bootstrapResult.error);
        }

        setUnreadNotificationCount(bootstrapResult.data?.unreadNotificationCount ?? 0);
        setUser(buildResolvedUser(supabaseUser, bootstrapResult.data?.profile ?? null));
      } catch (error) {
        hydratedSessionKeyRef.current = null;
        console.error('Auth hydration failed:', error);
        clearAuthenticatedState();
      }
    },
    [buildResolvedUser, clearAuthenticatedState]
  );

  /**
   * Verifies the current authentication status and updates the user state.
   * Handles error cases and updates loading state appropriately.
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (data.session) {
        await hydrateUserFromSession(data.session);
        resolveInitialAuth();
        return;
      }

      scheduleAnonymousResolution();
    } catch (error) {
      console.error('Auth check failed:', error);
      if (!initialResolutionSettledRef.current) {
        scheduleAnonymousResolution();
      } else {
        clearAuthenticatedState();
        resolveInitialAuth();
      }
    }
  }, [
    clearAuthenticatedState,
    hydrateUserFromSession,
    resolveInitialAuth,
    scheduleAnonymousResolution,
  ]);

  /**
   * Signs out the current user and redirects to the login page.
   * Handles the complete logout flow including state cleanup.
   *
   * @throws {Error} If the sign-out operation fails
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      setIsLoading(true);
      await authService.signOut();
      clearAuthenticatedState();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsLoading(false);
    }
  }, [clearAuthenticatedState]);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAuthResolved,
      isLoggingOut,
      unreadNotificationCount,
      checkAuth,
      refreshUnreadNotificationCount,
      decrementUnreadNotificationCount,
      clearUnreadNotificationCount,
      logout,
    }),
    [
      user,
      isLoading,
      isAuthResolved,
      isLoggingOut,
      unreadNotificationCount,
      checkAuth,
      refreshUnreadNotificationCount,
      decrementUnreadNotificationCount,
      clearUnreadNotificationCount,
      logout,
    ]
  );

  /**
   * Effect hook to initialize auth state and set up real-time auth listeners.
   * Subscribes to Supabase auth state changes and keeps local state in sync.
   */
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        awaitingInitialSessionRef.current = false;
      }

      if (event === 'SIGNED_OUT') {
        awaitingInitialSessionRef.current = false;
        clearInitialResolutionTimer();
        clearAuthenticatedState();
        setIsAuthResolved(true);
        setIsLoading(false);
        return;
      }

      if (!session) {
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        clearInitialResolutionTimer();
        setSessionAccessToken(session.access_token ?? null);
        hydratedSessionKeyRef.current = `${session.user.id}:${session.access_token ?? 'no-token'}`;
        return;
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        clearInitialResolutionTimer();
        setIsLoading(true);
        void hydrateUserFromSession(session).finally(() => {
          resolveInitialAuth();
        });
        return;
      }

      if (event === 'USER_UPDATED') {
        awaitingInitialSessionRef.current = false;
        clearInitialResolutionTimer();
        setIsLoading(true);
        void hydrateUserFromSession(session, { force: true }).finally(() => {
          resolveInitialAuth();
        });
      }
    });

    void checkAuth();

    return () => {
      clearInitialResolutionTimer();
      data.subscription.unsubscribe();
    };
  }, [
    checkAuth,
    clearAuthenticatedState,
    clearInitialResolutionTimer,
    hydrateUserFromSession,
    resolveInitialAuth,
  ]);

  useEffect(() => {
    const nextUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (previousUserId && previousUserId !== nextUserId) {
      clearAuthScopedQueries();
    }

    if (!nextUserId) {
      clearAuthScopedQueries();
      trackedSessionKeyRef.current = null;
    }

    previousUserIdRef.current = nextUserId;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !sessionAccessToken) {
      trackedSessionKeyRef.current = null;
      return;
    }

    const sessionKey = `${user.id}:${sessionAccessToken}`;
    if (trackedSessionKeyRef.current === sessionKey) {
      return;
    }

    let isCancelled = false;
    let animationFrameId: number | null = null;
    let timeoutId: number | null = null;
    let idleHandle: IdleCallbackHandle | null = null;
    const idleWindow = window as IdleWindow;

    const runTracking = (): void => {
      if (isCancelled) {
        return;
      }

      trackedSessionKeyRef.current = sessionKey;
      void trackCurrentSessionSilently();
    };

    animationFrameId = window.requestAnimationFrame(() => {
      if (typeof idleWindow.requestIdleCallback === 'function') {
        idleHandle = idleWindow.requestIdleCallback(runTracking, { timeout: 1500 });
        return;
      }

      timeoutId = window.setTimeout(runTracking, 1200);
    });

    return () => {
      isCancelled = true;
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (idleHandle !== null) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
    };
  }, [sessionAccessToken, trackCurrentSessionSilently, user?.id]);

  useEffect(() => {
    if (!user || !sessionAccessToken) return;

    const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
    const intervalId = window.setInterval(() => {
      void trackCurrentSessionSilently();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionAccessToken, trackCurrentSessionSilently, user]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
