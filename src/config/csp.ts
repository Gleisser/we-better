export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    process.env.VITE_API_URL || 'http://localhost:1337',
  ],
  'media-src': [
    "'self'",
    process.env.VITE_API_URL || 'http://localhost:1337',
  ],
  'connect-src': [
    "'self'",
    process.env.VITE_API_URL || 'http://localhost:1337'
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com"
  ],
  'frame-src': ["'self'"],
  'worker-src': ["'self'", "blob:"],
}; 