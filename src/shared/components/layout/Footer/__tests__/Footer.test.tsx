import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import { useFooter } from '@/shared/hooks/useFooter';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import styles from '../Footer.module.css';
import { FOOTER_FALLBACK } from '@/utils/constants/fallback';

// Mock the hooks
vi.mock('@/hooks/useFooter');
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

describe('Footer', () => {
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
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (useFooter as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<Footer />);

    // Check if loading message is displayed
    const loadingElement = screen.getByText(/Loading footer content/i);
    expect(loadingElement).toBeInTheDocument();
    
    // Verify ARIA attributes for accessibility
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load footer data');
    
    (useFooter as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Footer />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load footer data/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);
  });

  it('renders menu links correctly when data is loaded', () => {
    // Reset error handler mock to ensure no error state is shown
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    const mockFooterData = {
      data: FOOTER_FALLBACK,
      meta: {
        pagination: {
          page: 1,
          pageSize: 10,
          pageCount: 1,
          total: 1
        }
      }
    };

    (useFooter as any).mockReturnValue({
      data: mockFooterData,
      isLoading: false,
      isError: false
    });

    render(<Footer />);

    // Check menu titles
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    
    // Check some specific menu links
    expect(screen.getByRole('link', { name: 'AI Art Generator' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'API' })).toBeInTheDocument();
    
    // Verify navigation structure
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument();
  });

  it('renders social media section with correct icons and links', () => {
    (useFooter as any).mockReturnValue({
      data: {
        data: {
          ...FOOTER_FALLBACK,
          social_medias: [{
            logos: [
              { 
                id: 1, 
                name: 'Twitter',
                src: '/twitter-icon.svg'
              }
            ]
          }]
        }
      },
      isLoading: false
    });

    render(<Footer />);

    // Check social media section
    expect(screen.getByLabelText(/Stay Tuned/i)).toBeInTheDocument();
    
    // Check social icons
    const socialIcon = screen.getByAltText(/Twitter social media icon/i);
    expect(socialIcon).toBeInTheDocument();
    expect(socialIcon.closest('a')).toHaveAttribute('href', '#');
  });

  it('preloads all footer images on mount', async () => {
    const preloadImagesMock = vi.fn().mockResolvedValue(undefined);
    (useImagePreloader as any).mockReturnValue({
      preloadImages: preloadImagesMock
    });

    // Mock footer data with isAPI flag
    (useFooter as any).mockReturnValue({
      data: {
        data: FOOTER_FALLBACK
      },
      isLoading: false
    });

    render(<Footer />);

    expect(preloadImagesMock).toHaveBeenCalled();
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    // Check if the API URLs contain our expected image paths
    const expectedImages = [
      '/assets/images/footer/appstore.svg',
      '/assets/images/footer/play.svg',
      '/assets/images/footer/facebook-icon.svg'
    ];

    expectedImages.forEach(imagePath => {
      expect(calledUrls).toEqual(
        expect.arrayContaining([
          expect.stringContaining(imagePath)
        ])
      );
    });
  });

  it('renders app store download buttons correctly', () => {
    (useFooter as any).mockReturnValue({
      data: {
        data: FOOTER_FALLBACK
      },
      isLoading: false
    });

    render(<Footer />);

    const appStoreSection = screen.getByRole('region', { name: /get the app/i });
    expect(appStoreSection).toBeInTheDocument();
    
    // Check app store buttons
    const downloadButtons = screen.getAllByRole('link', { 
      name: /download we better app from .* - get access to ai tools on your mobile device/i
    });
    expect(downloadButtons.length).toBeGreaterThan(0);
  });
}); 