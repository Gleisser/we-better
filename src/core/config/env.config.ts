import { resolveAppApiBaseUrl } from './appApi';

export const ENV_CONFIG = {
  API: {
    URL: resolveAppApiBaseUrl(import.meta.env.VITE_API_BACKEND_URL),
    TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 45000,
  },
  RATE_LIMIT: {
    MAX_REQUESTS: Number(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 50,
    WINDOW: Number(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 60000,
  },
} as const;
