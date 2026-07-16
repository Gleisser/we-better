import { describe, expect, it } from 'vitest';
import { createAppApiUrl, resolveAppApiBaseUrl } from './appApi';

describe('appApi helpers', () => {
  it('resolves same-origin app api paths by default', () => {
    expect(resolveAppApiBaseUrl()).toBe('/api');
    expect(createAppApiUrl('/dashboard/overview')).toBe('/api/dashboard/overview');
  });

  it('appends query params to same-origin app api paths', () => {
    expect(
      createAppApiUrl('/dream-board', {
        query: {
          limit: 10,
          offset: 20,
          unread_only: true,
          skipped: undefined,
        },
      })
    ).toBe('/api/dream-board?limit=10&offset=20&unread_only=true');
  });

  it('builds an absolute app api URL only when explicitly requested', () => {
    expect(resolveAppApiBaseUrl('https://api.example.com/')).toBe('https://api.example.com/api');
    expect(
      createAppApiUrl('/notifications', {
        absoluteBackendOrigin: 'https://api.example.com/',
        query: { limit: 5 },
      })
    ).toBe('https://api.example.com/api/notifications?limit=5');
  });
});
