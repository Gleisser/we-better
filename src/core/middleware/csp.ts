import { CSP_POLICY } from '../config/csp';

export const generateCSP = (): string => {
  const policy = CSP_POLICY;

  return Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};
