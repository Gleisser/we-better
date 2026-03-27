import { supabase } from './supabaseClient';
import type { MissionCategoryId } from '@/features/missions/constants/categoryImageMap';
import { createAppApiUrl } from '@/core/config/appApi';

const MISSIONS_API_URL = createAppApiUrl('/missions');
const PROGRESS_API_URL = createAppApiUrl('/missions/progress');

const _MISSION_BADGE_IDS = [
  'explorer',
  'connector',
  'kindred',
  'spark',
  'momentum',
  'fuel-up',
  'recharge',
  'listener',
  'hydrated',
  'calm-core',
  'reflector',
  'protector',
  'unplugged',
  'tracker',
  'optimizer',
  'builder',
  'accelerator',
  'heartbeat',
  'memory-maker',
  'supporter',
  'tradition',
  'stillness',
  'grateful',
  'earthbound',
  'giver',
  'heartline',
  'presence',
  'bridge',
  'respect',
  'focus',
  'upskill',
  'spotlight',
  'connector-plus',
  'seed-planter',
  'pathfinder',
  'glow-up',
  'north-star',
] as const;

export type MissionDifficulty = 'bronze' | 'silver' | 'gold';
export type MissionEffort = 'light' | 'moderate' | 'intense';
export type MissionStatus = 'pending' | 'active' | 'completed';
export type MissionLocale = 'en' | 'pt-BR';
export type MissionBadge = (typeof _MISSION_BADGE_IDS)[number];

interface MissionProgressRow {
  mission_key: string;
  category_id: MissionCategoryId;
  status: Exclude<MissionStatus, 'pending'>;
  started_at: string | null;
  completed_at: string | null;
}

interface PatchProgressResponse {
  week: {
    weekStartDate: string;
    weekEndDate: string;
    timezone: string;
  };
  progress: MissionProgressRow;
}

export interface MissionItem {
  key: string;
  category: MissionCategoryId;
  title: string;
  description: string;
  stretchGoal: string;
  tip: string;
  effort: MissionEffort;
  estimatedMinutes: number;
  difficulty: MissionDifficulty;
  badge?: MissionBadge;
  sortOrder: number;
  status: MissionStatus;
  weekStartDate: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface MissionCategorySummary {
  id: MissionCategoryId;
  totalMissions: number;
  completedCount: number;
  activeCount: number;
  pendingCount: number;
  completionPercent: number;
  hasUpdate: boolean;
}

export interface MissionsApiResponse {
  week: {
    weekStartDate: string;
    weekEndDate: string;
    timezone: string;
  };
  categories: MissionCategorySummary[];
  missionsByCategory: Record<MissionCategoryId, MissionItem[]>;
}

interface UpdateMissionProgressInput {
  missionKey: string;
  categoryId: MissionCategoryId;
  status: Exclude<MissionStatus, 'pending'>;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const normalizeMissionLocale = (language: string): MissionLocale => {
  const normalized = language.toLowerCase();
  return normalized.startsWith('pt') ? 'pt-BR' : 'en';
};

const missionGatewayRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'PATCH',
  options?: {
    body?: Record<string, unknown>;
    requireAuth?: boolean;
  }
): Promise<T> => {
  const token = await getAuthToken();
  if (options?.requireAuth && !token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-User-Timezone': getBrowserTimezone(),
    },
    credentials: 'include',
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication expired');
    }

    const payload = await response.json().catch(() => ({}));
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : `API request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

// Source contract:
// - Missions catalog/content + assembled response: user-service (`/api/missions`)
// - Personalized progress writes: user-service (`/api/missions/progress`)
// - Upstream sources behind BFF: Strapi (content) + Supabase (progress)
export const fetchMissions = async (locale: MissionLocale): Promise<MissionsApiResponse> => {
  const query = new URLSearchParams();
  query.set('locale', locale);

  return missionGatewayRequest<MissionsApiResponse>(
    `${MISSIONS_API_URL}?${query.toString()}`,
    'GET'
  );
};

export const updateMissionProgress = async (
  input: UpdateMissionProgressInput
): Promise<PatchProgressResponse> => {
  return missionGatewayRequest<PatchProgressResponse>(PROGRESS_API_URL, 'PATCH', {
    requireAuth: true,
    body: {
      mission_key: input.missionKey,
      category_id: input.categoryId,
      status: input.status,
    },
  });
};
