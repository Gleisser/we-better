import path from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('frontend vercel routing', () => {
  it('rewrites /api traffic to user-service before the SPA fallback', () => {
    const configPath = path.resolve(process.cwd(), 'vercel.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as {
      rewrites?: Array<{ source?: string; destination?: string }>;
    };

    expect(config.rewrites?.[0]).toEqual({
      source: '/api/(.*)',
      destination: 'https://user-service-theta.vercel.app/api/$1',
    });

    expect(config.rewrites?.at(-1)).toEqual({
      source: '/(.*)',
      destination: '/index.html',
    });
  });
});
