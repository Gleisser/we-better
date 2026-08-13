import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renewDreamBoardPreviewUrls } from './dreamBoardPreviewApi';

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(async () => ({
    data: { session: { access_token: 'test-token' } },
  })),
}));

vi.mock('@/core/services/supabaseClient', () => ({
  supabase: { auth: { getSession: getSessionMock } },
}));

describe('renewDreamBoardPreviewUrls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the relative /api route so dev proxy and production rewrite remain authoritative', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          imagePreviewCardUrl: '/api/dream-board/previews?variant=card',
          imagePreviewWidgetUrl: '/api/dream-board/previews?variant=widget',
        }),
        { status: 200 }
      )
    );

    await renewDreamBoardPreviewUrls('dream-board-images', 'user-1/dream-1/random.webp');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/dream-board/previews',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
  });
});
