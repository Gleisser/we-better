export const viteMock = {
  env: {
    VITE_API_URL: 'http://localhost:1337/api',
    VITE_API_TOKEN: 'mock-token',
    VITE_API_TIMEOUT: '30000',
    VITE_RATE_LIMIT_MAX_REQUESTS: '50',
    VITE_RATE_LIMIT_WINDOW: '60000',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false
  }
};

// Mock import.meta
(global as any).import = { meta: viteMock }; 