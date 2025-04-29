/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TOKEN: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_RATE_LIMIT_MAX_REQUESTS: string
  readonly VITE_RATE_LIMIT_WINDOW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 