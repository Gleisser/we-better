import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tools from '../Tools';
import { useTool } from '@/shared/hooks/useTool';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { TOOLS_FALLBACK } from '@/constants/fallback';
import styles from '../Tools.module.css';

// Mock the hooks
vi.mock('@/hooks/useTool', () => ({
  useTool: vi.fn()
}));

vi.mock('@/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn()
}));

vi.mock('@/hooks/utils/useLoadingState', () => ({
  useLoadingState: vi.fn()
}));

vi.mock('@/hooks/utils/useImagePreloader', () => ({
  useImagePreloader: vi.fn()
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default mock implementations
    (useImagePreloader as any).mockReturnValue({
      preloadImages: vi.fn().mockResolvedValue(undefined),
      isPreloading: false
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });

    // Mock HTMLMediaElement methods
    window.HTMLMediaElement.prototype.load = vi.fn();
    window.HTMLMediaElement.prototype.play = vi.fn();
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (useTool as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    // Mock error handler
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    render(<Tools />);

    // Check for skeleton animation elements
    const skeletonElements = document.getElementsByClassName('animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Verify main content is not shown
    expect(screen.queryByRole('tablist', { name: /Tool categories/i })).not.toBeInTheDocument();
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load tools content');
    
    (useTool as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Tools />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load tools content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);

    // Verify main content is not shown
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  });

  it('renders main content with tabs when data is loaded', () => {
    // Mock successful data fetch
    (useTool as any).mockReturnValue({
      data: {
        data: {
          title: 'WeBetter Toolkit',
          tabs: TOOLS_FALLBACK
        }
      },
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    render(<Tools />);

    // Check title
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(/WeBetter/i);
    expect(title).toHaveTextContent(/Toolkit/i);

    // Check tabs navigation
    const tabList = screen.getByRole('tablist', { name: /Tool categories/i });
    expect(tabList).toBeInTheDocument();

    // Check first tab content is shown by default
    const firstTab = TOOLS_FALLBACK[0];
    const tabPanel = screen.getByRole('tabpanel');
    expect(tabPanel).toBeInTheDocument();
    expect(tabPanel).toHaveTextContent(firstTab.title);
    expect(tabPanel).toHaveTextContent(firstTab.description);

    // Check video element
    const video = screen.getByRole('presentation').querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('poster', expect.stringContaining(firstTab.id));
  });
}); 