import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDreamBoardImageDimensions,
  getDreamBoardImageSourceChain,
  getDreamBoardImageSources,
  markDreamBoardImageSourceFailed,
  resetDreamBoardImageSourceFailures,
} from './imageVariants';

const { storageFromMock } = vi.hoisted(() => ({
  storageFromMock: vi.fn((bucket: string) => ({
    getPublicUrl: (
      path: string,
      options?: { transform?: { width?: number; height?: number; quality?: number } }
    ) => ({
      data: {
        publicUrl: `https://cdn.example.com/storage/v1/render/image/public/${bucket}/${path}?width=${options?.transform?.width ?? 'original'}&height=${options?.transform?.height ?? 'original'}&quality=${options?.transform?.quality ?? 'original'}`,
      },
    }),
  })),
}));

vi.mock('@/core/services/supabaseClient', () => ({
  supabase: {
    storage: {
      from: storageFromMock,
    },
  },
}));

describe('imageVariants', () => {
  beforeEach(() => {
    storageFromMock.mockClear();
    resetDreamBoardImageSourceFailures();
  });

  it('builds transformed card and widget preview urls when storage metadata exists', () => {
    const sources = getDreamBoardImageSources({
      imageUrl: 'https://example.com/original/dream-1.jpg',
      imageStorageBucket: 'dream-board-images',
      imageStoragePath: 'dream-1.jpg',
      imagePlaceholder:
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    });

    expect(storageFromMock).toHaveBeenCalledWith('dream-board-images');
    expect(sources.original).toBe('https://example.com/original/dream-1.jpg');
    expect(sources.card).toContain('width=640');
    expect(sources.card).toContain('height=854');
    expect(sources.widget).toContain('width=320');
    expect(sources.widget).toContain('height=426');
    expect(sources.placeholder).toContain('data:image/gif');
  });

  it('prefers api-provided preview urls over generated storage transforms', () => {
    const sources = getDreamBoardImageSources({
      imageUrl: 'https://example.com/original/dream-preview.jpg',
      imageStorageBucket: 'dream-board-images',
      imageStoragePath: 'dream-preview.jpg',
      imagePreviewCardUrl: '/api/dream-board/previews?variant=card',
      imagePreviewWidgetUrl: '/api/dream-board/previews?variant=widget',
    });

    expect(sources.card).toBe('/api/dream-board/previews?variant=card');
    expect(sources.widget).toBe('/api/dream-board/previews?variant=widget');
  });

  it('falls back to the original image when storage metadata is missing', () => {
    const sources = getDreamBoardImageSources({
      imageUrl: 'https://example.com/original/dream-2.jpg',
    });

    expect(storageFromMock).not.toHaveBeenCalled();
    expect(sources).toMatchObject({
      original: 'https://example.com/original/dream-2.jpg',
      card: 'https://example.com/original/dream-2.jpg',
      widget: 'https://example.com/original/dream-2.jpg',
    });
    expect(sources.placeholder).toContain('data:image/gif');
  });

  it('builds a stable fallback chain for transformed previews', () => {
    const sourceChain = getDreamBoardImageSourceChain(
      {
        imageUrl: 'https://example.com/original/dream-3.jpg',
        imageStorageBucket: 'dream-board-images',
        imageStoragePath: 'dream-3.jpg',
      },
      'card'
    );

    expect(sourceChain).toEqual([
      expect.stringContaining('width=640'),
      expect.stringContaining('data:image/gif'),
    ]);
  });

  it('removes known-bad transformed urls from the fallback chain', () => {
    const sources = getDreamBoardImageSources({
      imageUrl: 'https://example.com/original/dream-4.jpg',
      imageStorageBucket: 'dream-board-images',
      imageStoragePath: 'dream-4.jpg',
    });

    markDreamBoardImageSourceFailed(sources.card);

    expect(
      getDreamBoardImageSourceChain(
        {
          imageUrl: 'https://example.com/original/dream-4.jpg',
          imageStorageBucket: 'dream-board-images',
          imageStoragePath: 'dream-4.jpg',
        },
        'card'
      )
    ).toEqual([expect.stringContaining('data:image/gif')]);
  });

  it('falls back from failed same-origin preview urls to the placeholder instead of the original', () => {
    markDreamBoardImageSourceFailed('/api/dream-board/previews?variant=card');

    expect(
      getDreamBoardImageSourceChain(
        {
          imageUrl: 'https://example.com/original/dream-5.jpg',
          imagePreviewCardUrl: '/api/dream-board/previews?variant=card',
        },
        'card'
      )
    ).toEqual([expect.stringContaining('data:image/gif')]);
  });

  it('returns intrinsic dimensions with a stable fallback', () => {
    expect(
      getDreamBoardImageDimensions({
        imageWidth: 640,
        imageHeight: 854,
      })
    ).toEqual({ width: 640, height: 854 });

    expect(getDreamBoardImageDimensions({})).toEqual({ width: 3, height: 4 });
  });
});
