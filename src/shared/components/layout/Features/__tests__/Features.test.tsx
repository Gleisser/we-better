import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Features from '../Features';
import { useFeature } from '@/shared/hooks/useFeature';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { FEATURES_CONSTANTS } from '@/constants/fallback';
import styles from '../Features.module.css';

// Mock the hooks
vi.mock('@/hooks/useFeature');
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

describe('Features', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set up fake timers for setTimeout
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
    vi.useRealTimers();
  });

  it('shows skeleton while data is being fetched', async () => {
    // Mock loading state
    (useFeature as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<Features />);

    // Initially should show skeleton
    expect(screen.getByTestId('features-skeleton')).toBeInTheDocument();

    // After timeout, should show fallback content
    vi.advanceTimersByTime(1000);

    // Flush all pending promises and timers
    await vi.runAllTimersAsync();

    // Check if fallback content is rendered
    // Verify skeleton is replaced with features content
    expect(screen.queryByTestId('features-skeleton')).not.toBeInTheDocument();
    
    // Check if features section is rendered with cards
    const featuresSection = screen.getByRole('main');
    expect(featuresSection).toBeInTheDocument();
    
    // Check if feature cards container is present
    const cardsContainer = screen.getByTestId('features-cards');
    expect(cardsContainer).toBeInTheDocument();
    
    // Verify some specific card content is present
    FEATURES_CONSTANTS.forEach(card => {
      const cardElement = screen.getByText(card.description);
      expect(cardElement).toBeInTheDocument();
    });
  });

  it('renders error state when there is an error fetching data', async () => {
    // Mock error state
    const mockError = new Error('Failed to load features content');
    
    (useFeature as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Features />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load features content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);

    // Verify fallback content is not shown yet (before timeout)
    expect(screen.queryByTestId('features-cards')).not.toBeInTheDocument();

    // After timeout, should show fallback content
    vi.advanceTimersByTime(1000);
    // Flush all pending promises and timers
    await vi.runAllTimersAsync();

    // Set showFallback to true after timeout
    (useFeature as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    // Verify fallback content is now shown
    expect(screen.getByTestId('features-cards')).toBeInTheDocument();
  });

  it('preloads brand images when component mounts', async () => {
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

    // Mock successful data fetch with brand logos
    const mockBrands = [
      { 
        logo: { 
          img: { url: '/brand1-logo.png' } 
        }
      },
      { 
        logo: { 
          img: { url: '/brand2-logo.png' } 
        }
      }
    ];

    (useFeature as any).mockReturnValue({
      data: {
        data: {
          cards: FEATURES_CONSTANTS,
          brands: mockBrands
        }
      },
      isLoading: false
    });

    render(<Features />);

    // Verify image preloading was triggered
    expect(preloadImagesMock).toHaveBeenCalled();
    expect(startLoadingMock).toHaveBeenCalled();
    
    // Verify the correct brand logo URLs were passed
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    mockBrands.forEach(brand => {
      expect(calledUrls).toContain(brand.logo.img.url);
    });

    // Wait for the async operation to complete
    await vi.advanceTimersByTimeAsync(0);

    // Verify loading state management
    expect(stopLoadingMock).toHaveBeenCalled();
  });

  it('renders features content correctly with actual data', () => {
    // Reset error handler to ensure no error state is shown
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    // Mock successful data fetch with custom content
    const mockData = {
      data: {
        cards: [
          {
            id: 1,
            title: "Custom Feature",
            description: "A unique feature description",
            link: "/custom-feature"
          }
        ],
        brands: [
          { 
            logo: { 
              img: { url: '/custom-brand-logo.png' } 
            },
            name: "Custom Brand"
          }
        ],
        subtext: "Featured Partners"
      }
    };

    (useFeature as any).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    render(<Features />);

    // Verify main content structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Get the features cards container first
    const cardContainer = screen.getByTestId('features-cards');
    expect(cardContainer).toBeInTheDocument();
    
    // Check card content by finding the specific card div
    const cardElements = within(cardContainer).getAllByRole('heading');
    const customFeatureCard = cardElements.find(element => 
      element.textContent?.includes('Custom Feature')
    );
    expect(customFeatureCard).toBeInTheDocument();
    expect(cardContainer).toHaveTextContent('A unique feature description');
    
    // Verify Featured section
    expect(screen.getByRole('heading', {
      name: 'Featured Partners'
    })).toBeInTheDocument();
    
    // Ensure we're not showing the skeleton or error state
    expect(screen.queryByTestId('features-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
}); 