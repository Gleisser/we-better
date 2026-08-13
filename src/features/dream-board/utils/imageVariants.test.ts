import { beforeEach, describe, expect, it } from 'vitest';
import {
  getDreamBoardImageDimensions,
  getDreamBoardImageSourceChain,
  getDreamBoardImageSources,
  markDreamBoardImageSourceFailed,
  resetDreamBoardImageSourceFailures,
} from './imageVariants';

describe('imageVariants', () => {
  beforeEach(() => {
    resetDreamBoardImageSourceFailures();
  });

  it('never derives a public URL from private storage metadata', () => {
    const sources = getDreamBoardImageSources({
      imageUrl:
        'https://project.supabase.co/storage/v1/object/public/dream-board-images/user/dream.jpg',
      imageStorageBucket: 'dream-board-images',
      imageStoragePath: 'dream-1.jpg',
      imagePlaceholder:
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    });

    expect(sources.original).toBe('');
    expect(sources.card).toBe('');
    expect(sources.widget).toBe('');
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

    expect(sources).toMatchObject({
      original: 'https://example.com/original/dream-2.jpg',
      card: 'https://example.com/original/dream-2.jpg',
      widget: 'https://example.com/original/dream-2.jpg',
    });
    expect(sources.placeholder).toContain('data:image/gif');
  });

  it('uses only the placeholder when a private ref has no current signed preview', () => {
    const sourceChain = getDreamBoardImageSourceChain(
      {
        imageUrl: 'https://example.com/original/dream-3.jpg',
        imageStorageBucket: 'dream-board-images',
        imageStoragePath: 'dream-3.jpg',
      },
      'card'
    );

    expect(sourceChain).toEqual([expect.stringContaining('data:image/gif')]);
  });

  it('removes known-bad transformed urls from the fallback chain', () => {
    const sources = getDreamBoardImageSources({
      imageStorageBucket: 'dream-board-images',
      imageStoragePath: 'dream-4.jpg',
      imagePreviewCardUrl: '/api/dream-board/previews?variant=card&expires=1',
    });

    markDreamBoardImageSourceFailed(sources.card);

    expect(
      getDreamBoardImageSourceChain(
        {
          imageStorageBucket: 'dream-board-images',
          imageStoragePath: 'dream-4.jpg',
          imagePreviewCardUrl: '/api/dream-board/previews?variant=card&expires=1',
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
