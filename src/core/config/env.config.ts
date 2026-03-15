const DEFAULT_API_BASE_URL = '/api';

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveApiBaseUrl(): string {
  const backendUrl = import.meta.env.VITE_API_BACKEND_URL;
  if (backendUrl) {
    try {
      return normalizeUrl(new URL('/api', backendUrl).toString());
    } catch {
      return `${normalizeUrl(backendUrl)}/api`;
    }
  }

  return DEFAULT_API_BASE_URL;
}

export const ENV_CONFIG = {
  API: {
    URL: resolveApiBaseUrl(),
    TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 45000,
  },
  RATE_LIMIT: {
    MAX_REQUESTS: Number(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 50,
    WINDOW: Number(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 60000,
  },
} as const;
