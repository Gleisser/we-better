import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Partners from '../Partners';
import { usePartner } from '@/shared/hooks/usePartner';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import styles from '../Partners.module.css';
import { PARTNERS_FALLBACK } from '@/utils/constants/fallback';

// Mock the hooks
vi.mock('@/hooks/usePartner');
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

describe('Partners', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    (useImagePreloader as any).mockReturnValue({
      preloadImages: vi.fn().mockResolvedValue(undefined)
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });

    // Set up fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up fake timers
    vi.useRealTimers();
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (usePartner as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<Partners />);

    // Check if loading message is displayed
    const loadingElement = screen.getByText(/Loading partners/i);
    expect(loadingElement).toBeInTheDocument();
    
    // Verify ARIA attributes for accessibility
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load partners content');
    
    (usePartner as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Partners />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load partners content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);
  });

  it('renders partners content correctly when data is loaded', () => {
    // Reset error handler to ensure no error state is shown
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    // Mock successful data fetch
    (usePartner as any).mockReturnValue({
      data: {
        data: PARTNERS_FALLBACK
      },
      isLoading: false
    });

    render(<Partners />);

    // Check title is rendered
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Partners')).toBeInTheDocument();

    // Check logo grid
    const logoGrid = screen.getByRole('region', { name: /partner logos/i });
    expect(logoGrid).toBeInTheDocument();

    // Check individual partner logos
    const partnerLogos = screen.getAllByRole('article');
    expect(partnerLogos.length).toBe(PARTNERS_FALLBACK.brands.length);

    // Verify each logo has proper attributes
    const logos = screen.getAllByRole('img');
    logos.forEach(logo => {
      expect(logo).toHaveAttribute('loading', 'lazy');
      expect(logo).toHaveAttribute('decoding', 'async');
    });
  });

  it('preloads partner logos when component mounts', async () => {
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
    (usePartner as any).mockReturnValue({
      data: {
        data: PARTNERS_FALLBACK
      },
      isLoading: false
    });

    render(<Partners />);

    // Verify image preloading was triggered
    expect(preloadImagesMock).toHaveBeenCalled();
    expect(startLoadingMock).toHaveBeenCalled();
    
    // Verify the correct logo URLs were passed
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    PARTNERS_FALLBACK.brands.forEach(brand => {
      expect(calledUrls).toEqual(
        expect.arrayContaining([
          expect.stringContaining(brand.logo.img.url)
        ])
      );
    });

    // Wait for the async operation to complete
    await vi.advanceTimersByTimeAsync(0);

    // Verify loading state management
    expect(stopLoadingMock).toHaveBeenCalled();
  });
}); 