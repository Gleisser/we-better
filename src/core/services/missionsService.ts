import { apiClient } from './api-client';
import { supabase } from './supabaseClient';
import type { MissionCategoryId } from '@/features/missions/constants/categoryImageMap';

const PROGRESS_API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/missions/progress`;
const CATALOG_PAGE_SIZE = 100;
const MAX_CATALOG_PAGES = 1000;

const MISSION_CATEGORY_IDS: MissionCategoryId[] = [
  'social',
  'health',
  'selfCare',
  'money',
  'family',
  'spirituality',
  'relationship',
  'career',
];
const MISSION_BADGE_IDS = [
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
const MISSION_BADGES = new Set<MissionBadge>(MISSION_BADGE_IDS);

export type MissionDifficulty = 'bronze' | 'silver' | 'gold';
export type MissionEffort = 'light' | 'moderate' | 'intense';
export type MissionStatus = 'pending' | 'active' | 'completed';
export type MissionLocale = 'en' | 'pt-BR';
export type MissionBadge = (typeof MISSION_BADGE_IDS)[number];

interface StrapiMission {
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
}

interface StrapiMissionResponse {
  data: unknown[];
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
  };
}

interface MissionProgressRow {
  mission_key: string;
  category_id: MissionCategoryId;
  status: Exclude<MissionStatus, 'pending'>;
  started_at: string | null;
  completed_at: string | null;
}

interface MissionProgressResponse {
  week: {
    weekStartDate: string;
    weekEndDate: string;
    timezone: string;
  };
  progress: MissionProgressRow[];
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

const progressApiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'PATCH',
  body?: Record<string, unknown>
): Promise<T> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-User-Timezone': getBrowserTimezone(),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
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

const parseStrapiMission = (item: unknown): StrapiMission | null => {
  if (!item || typeof item !== 'object') return null;
  const raw = item as Record<string, unknown>;
  const source =
    raw.attributes && typeof raw.attributes === 'object'
      ? (raw.attributes as Record<string, unknown>)
      : raw;

  const key = typeof source.key === 'string' ? source.key : '';
  const category = source.category;
  const rawBadge = typeof source.badge === 'string' ? source.badge : null;
  const badge =
    rawBadge && MISSION_BADGES.has(rawBadge as MissionBadge)
      ? (rawBadge as MissionBadge)
      : undefined;
  if (!key || !MISSION_CATEGORY_IDS.includes(category as MissionCategoryId)) {
    return null;
  }

  return {
    key,
    category: category as MissionCategoryId,
    title: typeof source.title === 'string' ? source.title : '',
    description: typeof source.description === 'string' ? source.description : '',
    stretchGoal: typeof source.stretchGoal === 'string' ? source.stretchGoal : '',
    tip: typeof source.tip === 'string' ? source.tip : '',
    effort: (source.effort ?? 'light') as MissionEffort,
    estimatedMinutes:
      typeof source.estimatedMinutes === 'number' && source.estimatedMinutes > 0
        ? source.estimatedMinutes
        : 1,
    difficulty: (source.difficulty ?? 'bronze') as MissionDifficulty,
    badge,
    sortOrder: typeof source.sortOrder === 'number' ? source.sortOrder : 0,
  };
};

const fetchMissionCatalogPage = async (
  locale: MissionLocale,
  page: number
): Promise<{ missions: StrapiMission[]; pageCount: number }> => {
  const query = new URLSearchParams();
  query.append('locale', locale);
  query.append('sort[0]', 'category:asc');
  query.append('sort[1]', 'sortOrder:asc');
  query.append('sort[2]', 'key:asc');
  query.append('pagination[page]', String(page));
  query.append('pagination[pageSize]', String(CATALOG_PAGE_SIZE));

  const { data } = await apiClient.get<StrapiMissionResponse>(`/missions?${query.toString()}`);
  const items = Array.isArray(data?.data) ? data.data : [];
  const pageCount = Number(data?.meta?.pagination?.pageCount);

  return {
    missions: items
      .map(parseStrapiMission)
      .filter((mission): mission is StrapiMission => mission !== null),
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
  };
};

const fetchMissionCatalog = async (locale: MissionLocale): Promise<StrapiMission[]> => {
  const missions: StrapiMission[] = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount && page <= MAX_CATALOG_PAGES) {
    const pageResult = await fetchMissionCatalogPage(locale, page);
    missions.push(...pageResult.missions);
    pageCount = Math.max(pageCount, pageResult.pageCount);
    page += 1;
  }

  if (page > MAX_CATALOG_PAGES && page <= pageCount) {
    throw new Error(`Exceeded maximum mission catalog pages (${MAX_CATALOG_PAGES})`);
  }

  return missions.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.key.localeCompare(b.key);
  });
};

const fetchMissionProgress = async (): Promise<MissionProgressResponse> => {
  return progressApiRequest<MissionProgressResponse>(PROGRESS_API_URL, 'GET');
};

const createEmptyMissionsByCategory = (): Record<MissionCategoryId, MissionItem[]> => {
  return MISSION_CATEGORY_IDS.reduce(
    (acc, categoryId) => {
      acc[categoryId] = [];
      return acc;
    },
    {} as Record<MissionCategoryId, MissionItem[]>
  );
};

const buildCategorySummaries = (
  missionsByCategory: Record<MissionCategoryId, MissionItem[]>
): MissionCategorySummary[] => {
  return MISSION_CATEGORY_IDS.map(categoryId => {
    const missions = missionsByCategory[categoryId] ?? [];
    const totalMissions = missions.length;
    const completedCount = missions.filter(mission => mission.status === 'completed').length;
    const activeCount = missions.filter(mission => mission.status === 'active').length;
    const pendingCount = Math.max(0, totalMissions - completedCount - activeCount);

    return {
      id: categoryId,
      totalMissions,
      completedCount,
      activeCount,
      pendingCount,
      completionPercent: totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0,
      hasUpdate: pendingCount > 0,
    };
  });
};

const mergeCatalogAndProgress = (
  catalog: StrapiMission[],
  progressPayload: MissionProgressResponse
): MissionsApiResponse => {
  const progressByMissionKey = new Map(
    progressPayload.progress.map(item => [item.mission_key, item])
  );
  const missionsByCategory = createEmptyMissionsByCategory();

  catalog.forEach(mission => {
    const progress = progressByMissionKey.get(mission.key);
    missionsByCategory[mission.category].push({
      ...mission,
      status: progress?.status ?? 'pending',
      weekStartDate: progressPayload.week.weekStartDate,
      startedAt: progress?.started_at ?? null,
      completedAt: progress?.completed_at ?? null,
    });
  });

  MISSION_CATEGORY_IDS.forEach(categoryId => {
    missionsByCategory[categoryId].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.key.localeCompare(b.key);
    });
  });

  return {
    week: progressPayload.week,
    categories: buildCategorySummaries(missionsByCategory),
    missionsByCategory,
  };
};

export const fetchMissions = async (locale: MissionLocale): Promise<MissionsApiResponse> => {
  const [catalog, progress] = await Promise.all([
    fetchMissionCatalog(locale),
    fetchMissionProgress(),
  ]);
  return mergeCatalogAndProgress(catalog, progress);
};

export const updateMissionProgress = async (
  input: UpdateMissionProgressInput
): Promise<PatchProgressResponse> => {
  return progressApiRequest<PatchProgressResponse>(PROGRESS_API_URL, 'PATCH', {
    mission_key: input.missionKey,
    category_id: input.categoryId,
    status: input.status,
  });
};
