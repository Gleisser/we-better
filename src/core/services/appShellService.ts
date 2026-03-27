import { supabase } from './supabaseClient';
import { createAppApiUrl } from '@/core/config/appApi';

const API_BASE_URL = createAppApiUrl('/app-shell');

export interface AppShellBootstrapResponse {
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  unreadNotificationCount: number;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for app shell API:', error);
    return null;
  }
};

class AppShellService {
  private static instance: AppShellService;

  private constructor() {}

  public static getInstance(): AppShellService {
    if (!AppShellService.instance) {
      AppShellService.instance = new AppShellService();
    }

    return AppShellService.instance;
  }

  async getBootstrap(accessToken?: string): Promise<{
    data: AppShellBootstrapResponse | null;
    error: string | null;
  }> {
    try {
      const token = accessToken ?? (await getAuthToken());
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_BASE_URL, {
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
        data: payload as unknown as AppShellBootstrapResponse,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch app shell data',
      };
    }
  }
}

export const appShellService = AppShellService.getInstance();
export default appShellService;
