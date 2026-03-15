import { useQuery } from '@tanstack/react-query';
import { AUTH_SCOPED_QUERY_META } from '@/core/config/react-query';
import {
  sessionsService,
  type SessionDto,
  type SessionsSummary,
} from '@/core/services/sessionsService';
import { useAuth } from '@/shared/hooks/useAuth';

const EMPTY_SESSION_SUMMARY: SessionsSummary = {
  totalSessions: 0,
  activeSessions: 0,
  currentSessionId: null,
  lastLogin: null,
  suspiciousSessions: 0,
  trustedDevices: 0,
};

type SessionsOverviewData = {
  summary: SessionsSummary;
  recentSessions: SessionDto[];
};

export const sessionsOverviewQueryKey = (userId: string | null) =>
  ['sessionsOverview', userId ?? 'anonymous'] as const;

export const sessionsHistoryQueryKey = (userId: string | null, limit: number, offset: number) =>
  ['sessionsHistory', userId ?? 'anonymous', limit, offset] as const;

interface UseSessionsOverviewResult {
  summary: SessionsSummary;
  recentSessions: SessionDto[];
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

interface UseSessionsHistoryOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseSessionsHistoryResult {
  sessions: SessionDto[];
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useSessionsOverview(): UseSessionsOverviewResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: sessionsOverviewQueryKey(userId),
    queryFn: async (): Promise<SessionsOverviewData> => {
      const result = await sessionsService.getSessionsOverview();
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to fetch sessions overview');
      }

      return result.data;
    },
    enabled: Boolean(userId),
    meta: AUTH_SCOPED_QUERY_META,
  });

  return {
    summary: query.data?.summary ?? EMPTY_SESSION_SUMMARY,
    recentSessions: query.data?.recentSessions ?? [],
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    refetch: async () => {
      await query.refetch();
    },
  };
}

export function useSessionsHistory(
  options: UseSessionsHistoryOptions = {}
): UseSessionsHistoryResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const query = useQuery({
    queryKey: sessionsHistoryQueryKey(userId, limit, offset),
    queryFn: async (): Promise<SessionDto[]> => {
      const result = await sessionsService.getHistory(limit, offset);
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to fetch session history');
      }

      return result.data.sessions;
    },
    enabled: Boolean(userId) && (options.enabled ?? true),
    meta: AUTH_SCOPED_QUERY_META,
  });

  return {
    sessions: query.data ?? [],
    error: query.error instanceof Error ? query.error.message : null,
    isLoading: query.isLoading,
    refetch: async () => {
      await query.refetch();
    },
  };
}
