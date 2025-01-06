import { CSP_POLICY } from '../config/csp';

export const generateCSP = () => {
  const policy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'style-src-elem': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'connect-src': ["'self'", 'http://localhost:1337'],
    'media-src': ["'self'", 'blob:', 'http://localhost:1337'],
    'frame-src': ["'self'"],
  };

  return Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}; 