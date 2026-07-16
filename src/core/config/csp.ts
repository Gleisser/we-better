import policy from './csp-policy.json';

export const CSP_POLICY = policy;

export const CSP_HEADER_VALUE = Object.entries(CSP_POLICY)
  .map(([directive, values]) => `${directive} ${values.join(' ')}`)
  .join('; ');
