import { supabase } from './supabaseClient';
import type { Affirmation } from './affirmationService';
import type { MoodEntry, WeeklyMoodPulseResponse } from './moodService';
import type { Quote } from './quoteService';
import { createAppApiUrl } from '@/core/config/appApi';
import type { LifeCategory } from '@/features/life-wheel/types';

const API_BASE_URL = createAppApiUrl('/dashboard/overview');

export interface DashboardOverviewResponse {
  inspiration: {
    quotes: Quote[];
    affirmations: Affirmation[];
    hasAffirmedToday: boolean;
  };
  lifeWheel: {
    entry?: {
      id: string;
      date: string;
      categories: LifeCategory[];
    };
  };
  mood: {
    entries: MoodEntry[];
    weeklyPulse: WeeklyMoodPulseResponse;
    monthlyPulse: WeeklyMoodPulseResponse;
  };
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for dashboard overview API:', error);
    return null;
  }
};

class DashboardOverviewService {
  private static instance: DashboardOverviewService;

  private constructor() {}

  public static getInstance(): DashboardOverviewService {
    if (!DashboardOverviewService.instance) {
      DashboardOverviewService.instance = new DashboardOverviewService();
    }

    return DashboardOverviewService.instance;
  }

  async getOverview(
    accessToken?: string,
    endDate?: string
  ): Promise<{
    data: DashboardOverviewResponse | null;
    error: string | null;
  }> {
    try {
      const token = accessToken ?? (await getAuthToken());
      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = endDate
        ? `${API_BASE_URL}?end_date=${encodeURIComponent(endDate)}`
        : API_BASE_URL;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        const errorMessage =
          typeof payload.error === 'string'
            ? payload.error
            : `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return {
        data: payload as unknown as DashboardOverviewResponse,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard overview',
      };
    }
  }
}

export const dashboardOverviewService = DashboardOverviewService.getInstance();
export default dashboardOverviewService;
