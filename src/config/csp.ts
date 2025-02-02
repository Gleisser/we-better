export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://sdk.scdn.co",
    "https://www.youtube.com",
    "https://*.youtube.com"
  ],
  'script-src-elem': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://sdk.scdn.co",
    "https://www.youtube.com",
    "https://*.youtube.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://*.googleapis.com",
  ],
  'style-src-elem': [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://*.googleapis.com",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://img.youtube.com",
    "https://*.ytimg.com",
    import.meta.env.VITE_API_URL || 'http://localhost:1337',
  ],
  'media-src': [
    "'self'",
    "https://*.youtube.com",
    import.meta.env.VITE_API_URL || 'http://localhost:1337',
  ],
  'connect-src': [
    "'self'",
    import.meta.env.VITE_API_URL || 'http://localhost:1337',
    "https://accounts.spotify.com",
    "https://api.spotify.com",
    "https://www.youtube.com",
    "https://*.youtube.com"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
    "https://*.gstatic.com",
    "https://fonts.googleapis.com",
    "https://*.googleapis.com"
  ],
  'frame-src': [
    "'self'",
    "https://open.spotify.com",
    "https://sdk.scdn.co",
    "https://www.youtube.com",
    "https://youtube.com"
  ],
  'worker-src': ["'self'", "blob:"],
}; 