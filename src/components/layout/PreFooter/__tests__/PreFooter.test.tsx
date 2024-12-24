import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PreFooter from '../PreFooter';
import { usePrefooter } from '@/hooks/usePrefooter';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';
import { PREFOOTER_FALLBACK } from '@/constants/fallback';
import styles from '../PreFooter.module.css';

// Mock the hooks
vi.mock('@/hooks/usePrefooter');
vi.mock('@/hooks/utils/useImagePreloader');
vi.mock('@/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn().mockReturnValue({
    isError: false,
    error: null,
    handleError: vi.fn()
  })
}));
vi.mock('@/hooks/utils/useLoadingState', () => ({
  useLoadingState: vi.fn().mockReturnValue({
    isLoading: false,
    startLoading: vi.fn(),
    stopLoading: vi.fn()
  })
}));

describe('PreFooter', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    // Set up fake timers
    vi.useFakeTimers();

    // Default mock implementations
    (useImagePreloader as any).mockReturnValue({
      preloadImages: vi.fn().mockResolvedValue(undefined)
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });
  });

  afterEach(() => {
    // Clean up fake timers
    vi.useRealTimers();
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (usePrefooter as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<PreFooter />);

    // Check if loading message is displayed
    const loadingElement = screen.getByText(/Loading content/i);
    expect(loadingElement).toBeInTheDocument();
    
    // Verify ARIA attributes for accessibility
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load pre-footer content');
    
    (usePrefooter as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<PreFooter />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load pre-footer content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);
  });

  it('renders main content correctly when data is loaded', () => {
    // Reset error handler to ensure no error state is shown
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    // Mock successful data fetch
    (usePrefooter as any).mockReturnValue({
      data: {
        data: PREFOOTER_FALLBACK
      },
      isLoading: false
    });

    render(<PreFooter />);

    // Check main content elements
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check CTA button and description
    const ctaButton = screen.getByRole('link', { name: /get started with leonardo ai/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', 'https://leonardo.ai');
    expect(ctaButton).toHaveAttribute('target', '_blank');
    expect(ctaButton).toHaveAttribute('rel', 'noopener noreferrer');

    // Check image
    const image = screen.getByAltText(/Interactive preview of Leonardo AI platform/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('preloads image when component mounts', async () => {
    // Mock the preload images function
    const preloadImagesMock = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 0))
    );
    (useImagePreloader as any).mockReturnValue({
      preloadImages: preloadImagesMock
    });

    // Mock loading state functions
    const startLoadingMock = vi.fn();
    const stopLoadingMock = vi.fn();
    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: startLoadingMock,
      stopLoading: stopLoadingMock
    });

    // Mock successful data fetch
    (usePrefooter as any).mockReturnValue({
      data: {
        data: PREFOOTER_FALLBACK
      },
      isLoading: false
    });

    render(<PreFooter />);

    // Verify image preloading was triggered
    expect(preloadImagesMock).toHaveBeenCalled();
    expect(startLoadingMock).toHaveBeenCalled();
    
    // Verify the correct image URL was passed
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    expect(calledUrls).toEqual(
      expect.arrayContaining([
        expect.stringContaining(PREFOOTER_FALLBACK.image.url)
      ])
    );

    // Wait for the async operation to complete
    await vi.advanceTimersByTimeAsync(0);

    // Verify loading state management
    expect(stopLoadingMock).toHaveBeenCalled();
  });
}); 