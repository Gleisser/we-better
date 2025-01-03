import { CSP_POLICY } from '../config/csp';

export function generateCSP() {
  return Object.entries(CSP_POLICY)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
} 