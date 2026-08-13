import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DreamBoardContentType, type DreamBoardContent, type DreamBoardData } from '../types';
import { normalizeDreamBoardDataForPersistence } from './imageStorage';

const { getSessionMock, storageFromMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(async () => ({
    data: { session: { user: { id: 'user-1' } } },
  })),
  storageFromMock: vi.fn(() => ({
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
  })),
}));

vi.mock('@/core/services/supabaseClient', () => ({
  supabase: {
    auth: { getSession: getSessionMock },
    storage: { from: storageFromMock },
  },
}));

const createBoard = (content: Partial<DreamBoardContent>): DreamBoardData => ({
  title: 'Private board',
  categories: ['Career'],
  content: [
    {
      id: 'dream-1',
      type: DreamBoardContentType.IMAGE,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 150 },
      rotation: 0,
      ...content,
    },
  ],
});

describe('Dream Board image persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('strips local/public delivery URLs when a private storage ref already exists', async () => {
    const result = await normalizeDreamBoardDataForPersistence(
      createBoard({
        src: 'https://project.supabase.co/storage/v1/object/public/dream-board-images/legacy',
        storageBucket: 'dream-board-images',
        storagePath: 'user-1/dream-1/random.webp',
        imagePreviewCardUrl: '/api/dream-board/previews?sig=short-lived',
        imagePreviewWidgetUrl: '/api/dream-board/previews?sig=short-lived',
      })
    );

    expect(result.data.content[0].src).toBeUndefined();
    expect(result.data.content[0].imagePreviewCardUrl).toBeUndefined();
    expect(result.data.content[0].storagePath).toBe('user-1/dream-1/random.webp');
    expect(storageFromMock).not.toHaveBeenCalled();
  });
});
