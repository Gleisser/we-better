/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BACKEND_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TOKEN: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_URL: string;
  readonly VITE_IMAGE_BASE_URL: string;
  readonly VITE_RATE_LIMIT_MAX_REQUESTS: string;
  readonly VITE_RATE_LIMIT_WINDOW: string;
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  readonly VITE_SPOTIFY_REDIRECT_URI: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
