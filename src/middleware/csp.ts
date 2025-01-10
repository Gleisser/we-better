import { CSP_POLICY } from '../config/csp';

export const generateCSP = () => {
  const policy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://sdk.scdn.co"],
    'script-src-elem': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://sdk.scdn.co"],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://*.googleapis.com"
    ],
    'style-src-elem': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://*.googleapis.com"
    ],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': [
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
      "https://*.gstatic.com",
      "https://fonts.googleapis.com",
      "https://*.googleapis.com"
    ],
    'connect-src': ["'self'", 'http://localhost:1337', "https://accounts.spotify.com", "https://api.spotify.com"],
    'media-src': ["'self'", 'blob:', 'http://localhost:1337'],
    'frame-src': [
      "'self'",
      "https://open.spotify.com",
      "https://sdk.scdn.co"
    ],
  };

  return Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}; 