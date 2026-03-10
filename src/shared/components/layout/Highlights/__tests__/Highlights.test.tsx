import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Highlights from '../Highlights';
import { useHighlight } from '@/shared/hooks/useHighlight';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useAssetPreload } from '@/shared/hooks/utils/useAssetPreload';
import { HIGHLIGHTS_FALLBACK } from '@/utils/constants/fallback';
import styles from '../Highlights.module.css';

vi.mock('@/shared/hooks/useHighlight', () => ({
  useHighlight: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useAssetPreload', () => ({
  useAssetPreload: vi.fn(),
}));

const mockedUseHighlight = vi.mocked(useHighlight);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);
const mockedUseAssetPreload = vi.mocked(useAssetPreload);

const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('Highlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn(),
    });
    mockedUseAssetPreload.mockReturnValue({
      isLoading: false,
      hasTimedOut: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the loading skeleton while the CMS content is still loading', () => {
    mockedUseHighlight.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isFetching: true,
      refetch: vi.fn(),
    } as never);

    render(<Highlights />);

    expect(document.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByRole('region', { name: /Highlights slider/i })).toBeNull();
  });

  it('renders the error state when the highlight query fails', () => {
    mockedUseHighlight.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as never);
    mockedUseErrorHandler.mockReturnValue({
      isError: true,
      error: new Error('Failed to load highlights content'),
      handleError: vi.fn(),
    });

    render(<Highlights />);

    expect(screen.getByRole('alert')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Try Again/i }).className).toContain(
      styles.retryButton
    );
  });

  it('keeps CMS /assets images on the local frontend origin instead of prefixing the Strapi host', () => {
    mockedUseHighlight.mockReturnValue({
      data: {
        data: {
          id: 1,
          documentId: 'highlight-doc',
          title: 'Use We Better today for',
          createdAt: '2026-03-11T00:00:00.000Z',
          updatedAt: '2026-03-11T00:00:00.000Z',
          publishedAt: '2026-03-11T00:00:00.000Z',
          slides: HIGHLIGHTS_FALLBACK.map((slide, index) => ({
            id: index + 1,
            documentId: `slide-${index + 1}`,
            title: slide.title,
            createdAt: '2026-03-11T00:00:00.000Z',
            updatedAt: '2026-03-11T00:00:00.000Z',
            publishedAt: '2026-03-11T00:00:00.000Z',
            image: {
              img: {
                id: index + 1,
                documentId: `image-${index + 1}`,
                name: `${slide.title}.webp`,
                alternativeText: slide.title,
                caption: slide.title,
                width: 800,
                height: 800,
                url: slide.image.img.formats.large.url,
                alt: slide.title,
                src: slide.image.img.formats.large.url,
                createdAt: '2026-03-11T00:00:00.000Z',
                updatedAt: '2026-03-11T00:00:00.000Z',
                publishedAt: '2026-03-11T00:00:00.000Z',
                formats: {
                  large: {
                    url: slide.image.img.formats.large.url,
                    width: 800,
                    height: 800,
                  },
                  medium: {
                    url: slide.image.img.formats.large.url,
                    width: 600,
                    height: 600,
                  },
                  small: {
                    url: slide.image.img.formats.large.url,
                    width: 400,
                    height: 400,
                  },
                  thumbnail: {
                    url: slide.image.img.formats.large.url,
                    width: 200,
                    height: 200,
                  },
                },
              },
            },
          })),
        },
      },
      isLoading: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    } as never);

    render(<Highlights />);

    const slider = screen.getByRole('region', { name: /Highlights slider/i });
    expect(slider).not.toBeNull();

    const firstImage = screen.getByRole('img');
    expect(firstImage.getAttribute('src')).toBe('/assets/images/highlights/goals.webp');
  });
});
