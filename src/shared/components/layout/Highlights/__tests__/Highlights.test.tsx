import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import Highlights from '../Highlights';
import { useHighlight } from '@/shared/hooks/useHighlight';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { HIGHLIGHTS_FALLBACK } from '@/utils/constants/fallback';
import styles from '../Highlights.module.css';
import type { HighlightResponse } from '@/utils/types/highlight';

type UseHighlightReturn = {
  data: HighlightResponse | null;
  isLoading: boolean;
};

type UseLoadingStateReturn = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

type UseErrorHandlerReturn = {
  isError: boolean;
  error: Error | null;
  handleError: (error: unknown) => void;
};

// Mock the hooks
vi.mock('@/hooks/useHighlight', () => ({
  useHighlight: vi.fn(),
}));

vi.mock('@/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('@/hooks/utils/useLoadingState', () => ({
  useLoadingState: vi.fn(),
}));

vi.mock('@/hooks/utils/useImagePreloader', () => ({
  useImagePreloader: vi.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Highlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default mock implementations
    (useImagePreloader as Mock).mockReturnValue({
      preloadImages: vi.fn().mockResolvedValue(undefined),
      isPreloading: false,
    });

    (useLoadingState as unknown as Mock<undefined[], UseLoadingStateReturn>).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading skeleton when data is being fetched', () => {
    // Mock loading state
    (useHighlight as unknown as Mock<undefined[], UseHighlightReturn>).mockReturnValue({
      data: null,
      isLoading: true,
    });

    // Mock error handler
    (useErrorHandler as unknown as Mock<undefined[], UseErrorHandlerReturn>).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn(),
    });

    render(<Highlights />);

    // Check for skeleton animation elements
    const skeletonElements = document.getElementsByClassName('animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Verify main content is not shown
    expect(screen.queryByRole('region', { name: /Highlights slider/i })).not.toBeInTheDocument();
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load highlights content');

    (useHighlight as unknown as Mock<undefined[], UseHighlightReturn>).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (useErrorHandler as unknown as Mock<undefined[], UseErrorHandlerReturn>).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn(),
    });

    render(<Highlights />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load highlights content/i)).toBeInTheDocument();

    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);

    // Verify main content is not shown
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Highlights slider/i })).not.toBeInTheDocument();
  });

  it('renders main content with slider when data is loaded', () => {
    // Mock successful data fetch
    (useHighlight as unknown as Mock<undefined[], UseHighlightReturn>).mockReturnValue({
      data: {
        data: {
          title: 'Use We Better today for',
          slides: HIGHLIGHTS_FALLBACK,
        },
      },
      isLoading: false,
    });

    (useErrorHandler as unknown as Mock<undefined[], UseErrorHandlerReturn>).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn(),
    });

    render(<Highlights />);

    // Check title
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Use We Better today for');

    // Check slider region
    const slider = screen.getByRole('region', { name: /Highlights slider/i });
    expect(slider).toBeInTheDocument();

    // Check first slide is visible
    const firstSlide = screen.getByRole('tabpanel', { name: /Slide 1 of/i });
    expect(firstSlide).toBeInTheDocument();
    expect(firstSlide).not.toHaveAttribute('aria-hidden', 'true');

    // Check first slide image
    const firstImage = screen.getByRole('img');
    expect(firstImage).toBeInTheDocument();
    expect(firstImage).toHaveAttribute('loading', 'eager');
    expect(firstImage).toHaveAttribute('decoding', 'async');
  });
});
