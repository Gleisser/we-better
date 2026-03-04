import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLatestDreamProgress } from '@/core/services/dreamProgressService';
import { getLatestDreamBoardData } from '@/features/dream-board/api/dreamBoardApi';
import { DreamBoardContentType, DreamBoardData } from '@/features/dream-board/types';
import { useLatestDreamBoardSnapshot } from '../useLatestDreamBoardSnapshot';

vi.mock('@/features/dream-board/api/dreamBoardApi', () => ({
  getLatestDreamBoardData: vi.fn(),
}));

vi.mock('@/core/services/dreamProgressService', () => ({
  getLatestDreamProgress: vi.fn(),
}));

const mockedGetLatestDreamBoardData = vi.mocked(getLatestDreamBoardData);
const mockedGetLatestDreamProgress = vi.mocked(getLatestDreamProgress);

const createQueryWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

const createDreamBoardData = (): DreamBoardData => ({
  id: 'board-123',
  title: 'My Dream Board',
  categories: ['Travel', 'Health'],
  content: [
    {
      id: 'dream-1',
      type: DreamBoardContentType.IMAGE,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      rotation: 0,
      categoryId: 'Travel',
      src: 'https://example.com/dream-1.jpg',
      alt: 'See Japan',
    },
    {
      id: 'dream-2',
      type: DreamBoardContentType.IMAGE,
      position: { x: 100, y: 100 },
      size: { width: 100, height: 100 },
      rotation: 0,
      categoryId: 'Health',
      src: 'text',
      alt: 'Ignore text content',
    },
  ],
});

describe('useLatestDreamBoardSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps image content and metrics from latest board + progress', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(createDreamBoardData());
    mockedGetLatestDreamProgress.mockResolvedValue([
      {
        id: 'progress-1',
        user_id: 'user-1',
        dream_board_content_id: 'dream-1',
        dream_title: 'See Japan',
        dream_category: 'Travel',
        progress_value: 0.75,
        previous_value: 0.5,
        adjustment_value: 0.25,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'progress-2',
        user_id: 'user-1',
        dream_board_content_id: 'unknown',
        dream_title: 'Unknown',
        dream_category: 'Travel',
        progress_value: 0.95,
        previous_value: 0.5,
        adjustment_value: 0.45,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const { result } = renderHook(() => useLatestDreamBoardSnapshot(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.dreams).toHaveLength(1);
    expect(result.current.dreams[0]).toMatchObject({
      id: 'dream-1',
      title: 'See Japan',
      category: 'Travel',
      imageUrl: 'https://example.com/dream-1.jpg',
      progress: 0.75,
    });
    expect(result.current.metrics).toEqual({
      imageCount: 1,
      categoryCount: 1,
      averageProgress: 0.75,
    });
  });

  it('returns empty snapshot for missing or empty board', async () => {
    mockedGetLatestDreamBoardData.mockResolvedValue(null);
    mockedGetLatestDreamProgress.mockResolvedValue([]);

    const { result } = renderHook(() => useLatestDreamBoardSnapshot(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dreams).toEqual([]);
    expect(result.current.metrics).toEqual({
      imageCount: 0,
      categoryCount: 0,
      averageProgress: null,
    });
    expect(result.current.error).toBeNull();
  });

  it('surfaces load error and refreshes successfully', async () => {
    mockedGetLatestDreamBoardData.mockRejectedValue(new Error('Snapshot failed'));
    mockedGetLatestDreamProgress.mockResolvedValue([]);

    const { result } = renderHook(() => useLatestDreamBoardSnapshot(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.error).toBe('Snapshot failed');
      },
      { timeout: 4000 }
    );

    mockedGetLatestDreamBoardData.mockReset();
    mockedGetLatestDreamBoardData.mockResolvedValueOnce(createDreamBoardData());
    mockedGetLatestDreamProgress.mockReset();
    mockedGetLatestDreamProgress.mockResolvedValueOnce([]);

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.metrics.imageCount).toBe(1);
  });
});
