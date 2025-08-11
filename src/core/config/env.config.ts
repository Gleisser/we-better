export const ENV_CONFIG = {
  API: {
    URL:
      import.meta.env.VITE_API_BASE_URL || 'https://original-melody-94a4138af3.strapiapp.com/api',
    TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  RATE_LIMIT: {
    MAX_REQUESTS: Number(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 50,
    WINDOW: Number(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 60000,
  },
} as const;
