import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLatestDreamProgress } from '@/core/services/dreamProgressService';
import { getLatestDreamBoardData } from '../api/dreamBoardApi';
import { DreamBoardContentType, DreamBoardData } from '../types';
import { normalizeDreamCategoryKey } from '../utils/categoryUtils';

const DEFAULT_TITLE_PREFIX = 'Dream';
const DREAM_BOARD_SNAPSHOT_QUERY_KEY = ['dreamBoard', 'latestSnapshot'] as const;
const DREAM_BOARD_SNAPSHOT_STALE_TIME = 1000 * 60 * 5;

type DreamBoardDataWithBackendTimestamps = DreamBoardData & {
  created_at?: string;
  updated_at?: string;
};

export type DreamBoardWidgetDream = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  updatedAt: string;
  progress: number;
};

type DreamBoardSnapshotMetrics = {
  imageCount: number;
  categoryCount: number;
  averageProgress: number | null;
};

type DreamBoardSnapshotData = {
  dreams: DreamBoardWidgetDream[];
  metrics: DreamBoardSnapshotMetrics;
};

export type UseLatestDreamBoardSnapshotResult = {
  dreams: DreamBoardWidgetDream[];
  metrics: DreamBoardSnapshotMetrics;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const EMPTY_SNAPSHOT: DreamBoardSnapshotData = {
  dreams: [],
  metrics: {
    imageCount: 0,
    categoryCount: 0,
    averageProgress: null,
  },
};

const clampProgressValue = (value: number): number => Math.max(0, Math.min(1, value));

const getBoardUpdatedAt = (board: DreamBoardDataWithBackendTimestamps): string =>
  board.updatedAt ||
  board.updated_at ||
  board.createdAt ||
  board.created_at ||
  new Date().toISOString();

const loadLatestDreamBoardSnapshot = async (): Promise<DreamBoardSnapshotData> => {
  const [boardData, latestProgressEntries] = await Promise.all([
    getLatestDreamBoardData(),
    getLatestDreamProgress(),
  ]);

  if (!boardData || !Array.isArray(boardData.content) || boardData.content.length === 0) {
    return EMPTY_SNAPSHOT;
  }

  const boardWithTimestamps = boardData as DreamBoardDataWithBackendTimestamps;
  const boardUpdatedAt = getBoardUpdatedAt(boardWithTimestamps);

  const imageContent = boardData.content.filter(content => {
    if (content.type !== DreamBoardContentType.IMAGE) {
      return false;
    }

    if (!content.id || typeof content.src !== 'string') {
      return false;
    }

    const source = content.src.trim();
    if (!source || source.toLowerCase() === 'text') {
      return false;
    }

    return true;
  });

  if (imageContent.length === 0) {
    return EMPTY_SNAPSHOT;
  }

  const contentIds = new Set(imageContent.map(content => content.id));
  const progressByContentId = new Map<string, number>();

  latestProgressEntries.forEach(progressEntry => {
    if (!contentIds.has(progressEntry.dream_board_content_id)) {
      return;
    }

    if (!progressByContentId.has(progressEntry.dream_board_content_id)) {
      progressByContentId.set(
        progressEntry.dream_board_content_id,
        clampProgressValue(progressEntry.progress_value)
      );
    }
  });

  const dreams = imageContent.map((content, index) => {
    const imageUrl = typeof content.src === 'string' ? content.src.trim() : '';
    const title =
      content.alt?.trim() || content.caption?.trim() || `${DEFAULT_TITLE_PREFIX} ${index + 1}`;
    const category = content.categoryId?.trim() || 'General';

    return {
      id: content.id,
      title,
      category,
      imageUrl,
      updatedAt: boardUpdatedAt,
      progress: progressByContentId.get(content.id) ?? 0,
    };
  });

  const categoryKeys = new Set(dreams.map(dream => normalizeDreamCategoryKey(dream.category)));
  const averageProgress =
    dreams.length > 0
      ? dreams.reduce((total, dream) => total + dream.progress, 0) / dreams.length
      : null;

  return {
    dreams,
    metrics: {
      imageCount: dreams.length,
      categoryCount: categoryKeys.size,
      averageProgress,
    },
  };
};

export const useLatestDreamBoardSnapshot = (): UseLatestDreamBoardSnapshotResult => {
  const { data, isLoading, error, refetch } = useQuery<DreamBoardSnapshotData>({
    queryKey: DREAM_BOARD_SNAPSHOT_QUERY_KEY,
    queryFn: loadLatestDreamBoardSnapshot,
    staleTime: DREAM_BOARD_SNAPSHOT_STALE_TIME,
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const refresh = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  const snapshotData = useMemo(() => data ?? EMPTY_SNAPSHOT, [data]);

  return {
    dreams: snapshotData.dreams,
    metrics: snapshotData.metrics,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh,
  };
};
