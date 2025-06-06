if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined');
}

if (!import.meta.env.VITE_API_TOKEN) {
  throw new Error('VITE_API_TOKEN is not defined');
}

if (!import.meta.env.VITE_IMAGE_BASE_URL) {
  throw new Error('VITE_IMAGE_BASE_URL is not defined');
}

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  token: import.meta.env.VITE_API_TOKEN,
  imageBaseURL: import.meta.env.VITE_IMAGE_BASE_URL,
} as const; 