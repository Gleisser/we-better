const DEFAULT_BACKEND_ORIGIN = 'http://localhost:3000';

function resolveOrigin(rawUrl: string | undefined, fallbackOrigin: string): string {
  if (!rawUrl) return fallbackOrigin;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return rawUrl;
  }
}

const backendOrigin = resolveOrigin(
  import.meta.env.VITE_API_BACKEND_URL || import.meta.env.VITE_API_BASE_URL,
  DEFAULT_BACKEND_ORIGIN
);
const imageOrigin = resolveOrigin(import.meta.env.VITE_IMAGE_BASE_URL, backendOrigin);

export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://sdk.scdn.co',
    'https://www.youtube.com',
    'https://*.youtube.com',
  ],
  'script-src-elem': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://sdk.scdn.co',
    'https://www.youtube.com',
    'https://*.youtube.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://*.googleapis.com',
  ],
  'style-src-elem': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://*.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://images.unsplash.com',
    'https://img.youtube.com',
    'https://*.ytimg.com',
    backendOrigin,
    imageOrigin,
  ],
  'media-src': ["'self'", 'https://*.youtube.com', backendOrigin, imageOrigin],
  'connect-src': [
    "'self'",
    backendOrigin,
    'https://accounts.spotify.com',
    'https://api.spotify.com',
    'https://www.youtube.com',
    'https://*.youtube.com',
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
    'https://*.gstatic.com',
    'https://fonts.googleapis.com',
    'https://*.googleapis.com',
  ],
  'frame-src': [
    "'self'",
    'https://open.spotify.com',
    'https://sdk.scdn.co',
    'https://www.youtube.com',
    'https://youtube.com',
  ],
  'worker-src': ["'self'", 'blob:'],
};
