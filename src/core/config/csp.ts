const DEFAULT_BACKEND_ORIGIN = 'http://localhost:3000';

const APP_HOST_SOURCES = ['https://webetter.ai', 'https://*.webetter.ai', 'https://*.vercel.app'];
const STYLE_SOURCES = ['https://fonts.googleapis.com'];
const FONT_SOURCES = ['https://fonts.gstatic.com'];
const IMAGE_CDN_SOURCES = [
  'https://images.unsplash.com',
  'https://plus.unsplash.com',
  'https://img.icons8.com',
  'https://via.placeholder.com',
];
const SUPABASE_WILDCARD_SOURCES = ['https://*.supabase.co', 'wss://*.supabase.co'];

function resolveOrigin(rawUrl: string | undefined, fallbackOrigin: string): string {
  if (!rawUrl) return fallbackOrigin;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return rawUrl;
  }
}

function resolveRealtimeOrigin(rawUrl: string | undefined): string {
  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.origin;
  } catch {
    if (rawUrl.startsWith('https://')) return rawUrl.replace(/^https:/, 'wss:');
    if (rawUrl.startsWith('http://')) return rawUrl.replace(/^http:/, 'ws:');
    return '';
  }
}

function uniqueSources(sources: Array<string | undefined>): string[] {
  return [...new Set(sources.filter((source): source is string => Boolean(source)))];
}

const backendOrigin = resolveOrigin(
  import.meta.env.VITE_API_BACKEND_URL || import.meta.env.VITE_API_BASE_URL,
  DEFAULT_BACKEND_ORIGIN
);
const imageOrigin = resolveOrigin(import.meta.env.VITE_IMAGE_BASE_URL, backendOrigin);
const supabaseOrigin = resolveOrigin(import.meta.env.VITE_SUPABASE_URL, '');
const supabaseRealtimeOrigin = resolveRealtimeOrigin(import.meta.env.VITE_SUPABASE_URL);

export const CSP_POLICY = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  'script-src': ["'self'"],
  'script-src-elem': ["'self'"],
  'style-src': uniqueSources(["'self'", "'unsafe-inline'", ...STYLE_SOURCES]),
  'style-src-elem': uniqueSources(["'self'", "'unsafe-inline'", ...STYLE_SOURCES]),
  'img-src': uniqueSources([
    "'self'",
    'data:',
    'blob:',
    ...IMAGE_CDN_SOURCES,
    ...APP_HOST_SOURCES,
    'https://*.supabase.co',
    backendOrigin,
    imageOrigin,
    supabaseOrigin,
  ]),
  'media-src': uniqueSources([
    "'self'",
    'blob:',
    ...APP_HOST_SOURCES,
    'https://*.supabase.co',
    backendOrigin,
    imageOrigin,
    supabaseOrigin,
  ]),
  'connect-src': uniqueSources([
    "'self'",
    ...APP_HOST_SOURCES,
    ...SUPABASE_WILDCARD_SOURCES,
    backendOrigin,
    imageOrigin,
    supabaseOrigin,
    supabaseRealtimeOrigin,
  ]),
  'font-src': uniqueSources(["'self'", 'data:', ...FONT_SOURCES]),
  'frame-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
};

export const CSP_HEADER_VALUE = Object.entries(CSP_POLICY)
  .map(([directive, values]) => `${directive} ${values.join(' ')}`)
  .join('; ');
