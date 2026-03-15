import { supabase } from './supabaseClient';

const API_BASE_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/security/sessions`;

export type SessionStatus = 'current' | 'active' | 'inactive' | 'logged_out';
export type SessionAuthMethod = 'password' | '2fa' | 'oauth' | 'magic_link' | 'biometric';

export interface SessionDto {
  id: string;
  device: string;
  browser: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string | null;
  isCurrent: boolean;
  isActive: boolean;
  status: SessionStatus;
  authMethod: SessionAuthMethod;
}

export interface SessionsSummary {
  totalSessions: number;
  activeSessions: number;
  currentSessionId: string | null;
  lastLogin: string | null;
  suspiciousSessions: number;
  trustedDevices: number;
}

export interface SessionsOverview {
  summary: SessionsSummary;
  recentSessions: SessionDto[];
  activeSessions: SessionDto[];
}

export interface SessionsHistory {
  sessions: SessionDto[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface LogoutOthersResponse {
  success: boolean;
  revokedSessionCount: number;
  warning?: string;
}

interface TrackSessionBody {
  deviceFingerprint: string;
  deviceInfo: {
    deviceName: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: string;
  };
  locationInfo: {
    timezone: string;
    locale: string;
  };
  authMethod: SessionAuthMethod;
  twoFactorUsed: boolean;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for sessions API:', error);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object
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
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const errorMessage =
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
};

function parseBrowserInfo(userAgent: string): { browser: string; version: string } {
  const browserMatchers = [
    { regex: /Edg\/(\d+(?:\.\d+)?)/, name: 'Edge' },
    { regex: /OPR\/(\d+(?:\.\d+)?)/, name: 'Opera' },
    { regex: /Chrome\/(\d+(?:\.\d+)?)/, name: 'Chrome' },
    { regex: /Firefox\/(\d+(?:\.\d+)?)/, name: 'Firefox' },
    { regex: /Version\/(\d+(?:\.\d+)?).*Safari/, name: 'Safari' },
  ];

  for (const matcher of browserMatchers) {
    const match = userAgent.match(matcher.regex);
    if (match) {
      return { browser: matcher.name, version: match[1] };
    }
  }

  return { browser: 'Unknown', version: '' };
}

function parseOsInfo(userAgent: string): { os: string; version: string } {
  const lower = userAgent.toLowerCase();

  if (lower.includes('windows')) {
    return { os: 'Windows', version: '' };
  }

  if (lower.includes('mac os x') || lower.includes('macintosh')) {
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    return { os: 'macOS', version: match?.[1]?.replace(/_/g, '.') || '' };
  }

  if (lower.includes('android')) {
    const match = userAgent.match(/Android ([\d.]+)/);
    return { os: 'Android', version: match?.[1] || '' };
  }

  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ios')) {
    const match = userAgent.match(/OS ([\d_]+)/);
    return { os: 'iOS', version: match?.[1]?.replace(/_/g, '.') || '' };
  }

  if (lower.includes('linux')) {
    return { os: 'Linux', version: '' };
  }

  return { os: 'Unknown', version: '' };
}

function resolveDeviceType(userAgent: string): string {
  const lower = userAgent.toLowerCase();
  if (/(tablet|ipad)/.test(lower)) return 'tablet';
  if (/(mobile|iphone|android)/.test(lower)) return 'mobile';
  return 'desktop';
}

function resolveDeviceName(userAgent: string, os: string): string {
  const lower = userAgent.toLowerCase();

  if (lower.includes('iphone')) return 'iPhone';
  if (lower.includes('ipad')) return 'iPad';
  if (lower.includes('android')) return 'Android device';
  if (os === 'macOS') return 'Mac';
  if (os === 'Windows') return 'Windows PC';
  if (os === 'Linux') return 'Linux device';
  return 'Unknown device';
}

function buildDeviceFingerprint(userAgent: string, timezone: string, locale: string): string {
  const seed = `${userAgent}|${navigator.platform || ''}|${timezone}|${locale}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  return `web-${Math.abs(hash)}`;
}

function buildTrackBody(options?: {
  authMethod?: SessionAuthMethod;
  twoFactorUsed?: boolean;
}): TrackSessionBody {
  const userAgent = navigator.userAgent || 'unknown';
  const locale = navigator.language || 'en-US';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const { browser, version: browserVersion } = parseBrowserInfo(userAgent);
  const { os, version: osVersion } = parseOsInfo(userAgent);

  return {
    deviceFingerprint: buildDeviceFingerprint(userAgent, timezone, locale),
    deviceInfo: {
      deviceName: resolveDeviceName(userAgent, os),
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType: resolveDeviceType(userAgent),
    },
    locationInfo: {
      timezone,
      locale,
    },
    authMethod: options?.authMethod || 'password',
    twoFactorUsed: options?.twoFactorUsed || false,
  };
}

class SessionsService {
  private static instance: SessionsService;

  private constructor() {}

  public static getInstance(): SessionsService {
    if (!SessionsService.instance) {
      SessionsService.instance = new SessionsService();
    }

    return SessionsService.instance;
  }

  async getSessionsOverview(): Promise<{ data: SessionsOverview | null; error: string | null }> {
    try {
      const data = await apiRequest<SessionsOverview>(API_BASE_URL);
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch sessions overview',
      };
    }
  }

  async getHistory(
    limit = 50,
    offset = 0
  ): Promise<{ data: SessionsHistory | null; error: string | null }> {
    try {
      const url = `${API_BASE_URL}/history?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
      const data = await apiRequest<SessionsHistory>(url);
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch session history',
      };
    }
  }

  async trackCurrentSession(options?: {
    authMethod?: SessionAuthMethod;
    twoFactorUsed?: boolean;
  }): Promise<{ data: SessionDto | null; error: string | null }> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify(buildTrackBody(options)),
      });

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        const errorMessage =
          typeof payload.error === 'string'
            ? payload.error
            : `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = payload as unknown as SessionDto;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to track session',
      };
    }
  }

  async logoutOtherSessions(): Promise<{
    data: LogoutOthersResponse | null;
    error: string | null;
  }> {
    try {
      const data = await apiRequest<LogoutOthersResponse>(`${API_BASE_URL}/logout-others`, 'POST');
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to logout other sessions',
      };
    }
  }
}

export const sessionsService = SessionsService.getInstance();
export default sessionsService;
