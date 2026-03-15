import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DreamBoardWidgetDream,
  UseLatestDreamBoardSnapshotResult,
} from '@/features/dream-board/hooks/useLatestDreamBoardSnapshot';
import DreamBoardTimelineWidget from './DreamBoardTimelineWidget';

const mockNavigate = vi.fn();

vi.mock('@/shared/hooks/useTranslation', () => ({
  useDashboardTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>): string => {
      if (key === 'widgets.dreamBoardWidget.counter') {
        return `${options?.current as number} / ${options?.total as number}`;
      }
      return key;
    },
    currentLanguage: 'en',
  }),
}));

vi.mock('@/features/dream-board/hooks/useLatestDreamBoardSnapshot', () => ({
  useLatestDreamBoardSnapshot: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const createDream = (id: string, title: string, category: string): DreamBoardWidgetDream => ({
  id,
  title,
  category,
  imageUrl: `https://example.com/${id}.jpg`,
  updatedAt: '2026-02-26T00:00:00.000Z',
  progress: 0.5,
});

const createSnapshot = (
  overrides: Partial<UseLatestDreamBoardSnapshotResult> = {}
): UseLatestDreamBoardSnapshotResult => ({
  dreams: [],
  metrics: {
    imageCount: 0,
    categoryCount: 0,
    averageProgress: null,
  },
  isLoading: false,
  error: null,
  refresh: vi.fn(async () => undefined),
  ...overrides,
});

describe('DreamBoardTimelineWidget', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders button to open Dream Board page', () => {
    render(<DreamBoardTimelineWidget snapshotOverride={createSnapshot()} />);
    fireEvent.click(screen.getByText('widgets.dreamBoardWidget.openDreamBoard'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/dream-board');
  });

  it('renders loading state', () => {
    render(<DreamBoardTimelineWidget snapshotOverride={createSnapshot({ isLoading: true })} />);
    expect(screen.getByText('widgets.dreamBoardWidget.loading')).not.toBeNull();
  });

  it('renders informational empty state with no CTA action button', () => {
    render(<DreamBoardTimelineWidget snapshotOverride={createSnapshot()} />);

    expect(screen.getByText('widgets.dreamBoardWidget.empty.title')).not.toBeNull();
    expect(screen.getByText('widgets.dreamBoardWidget.empty.description')).not.toBeNull();
    expect(screen.queryByText('dreamBoard.timelineGallery.addImage')).toBeNull();
  });

  it('renders error state and retries via refresh', async () => {
    const refresh = vi.fn(async () => undefined);
    render(
      <DreamBoardTimelineWidget snapshotOverride={createSnapshot({ error: 'Failed', refresh })} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('widgets.dreamBoardWidget.retry'));
    });

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('rotates carousel with arrows and keyboard and keeps edit actions hidden', () => {
    render(
      <DreamBoardTimelineWidget
        snapshotOverride={createSnapshot({
          dreams: [
            createDream('dream-1', 'Dream One', 'Travel'),
            createDream('dream-2', 'Dream Two', 'Health'),
            createDream('dream-3', 'Dream Three', 'Career'),
          ],
          metrics: { imageCount: 3, categoryCount: 3, averageProgress: 0.66 },
        })}
      />
    );

    expect(screen.getByText('Dream One')).not.toBeNull();

    fireEvent.click(screen.getByLabelText('widgets.dreamBoardWidget.nextImage'));
    expect(screen.getByText('Dream Two')).not.toBeNull();

    fireEvent.keyDown(screen.getByLabelText('widgets.dreamBoardWidget.carouselAria'), {
      key: 'ArrowLeft',
    });
    expect(screen.getByText('Dream One')).not.toBeNull();

    expect(screen.getByText('widgets.dreamBoardWidget.metrics.averageProgress')).not.toBeNull();
    expect(screen.getByText('66%')).not.toBeNull();
    expect(screen.queryByText('widgets.dreamBoardWidget.metrics.images')).toBeNull();
    expect(screen.queryByText('widgets.dreamBoardWidget.metrics.categories')).toBeNull();
    expect(screen.queryByText('dreamBoard.timelineGallery.addImage')).toBeNull();
    expect(screen.queryByText('×')).toBeNull();
  });
});
