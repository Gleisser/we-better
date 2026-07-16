import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CSP_HEADER_VALUE, CSP_POLICY } from './csp';

describe('CSP policy', () => {
  it('allows only the Typebot API and streaming origins required by the embed', () => {
    expect(CSP_POLICY['connect-src']).toContain('https://typebot.io');
    expect(CSP_POLICY['connect-src']).toContain('wss://partykit.typebot.io');
    expect(CSP_POLICY['frame-src']).toEqual(["'self'"]);
    expect(CSP_POLICY['connect-src']).not.toContain('*');
    expect(CSP_POLICY['connect-src']).not.toContain('https://*.typebot.io');
    expect(CSP_POLICY['frame-ancestors']).toEqual(["'none'"]);
    expect(CSP_POLICY['object-src']).toEqual(["'none'"]);
  });

  it('keeps the Vercel deployment header synchronized with the policy source', () => {
    const vercelConfig = JSON.parse(
      readFileSync(path.resolve(process.cwd(), 'vercel.json'), 'utf8')
    ) as { headers: Array<{ headers: Array<{ key: string; value: string }> }> };
    const header = vercelConfig.headers
      .flatMap(rule => rule.headers)
      .find(candidate => candidate.key.toLowerCase() === 'content-security-policy');

    expect(header?.value).toBe(CSP_HEADER_VALUE);
  });
});
