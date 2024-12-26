import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Showcase from '../Showcase';
import { useShowcase } from '@/hooks/useShowcase';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import styles from '../Showcase.module.css';

// Mock the hooks
vi.mock('@/hooks/useShowcase', () => ({
  useShowcase: vi.fn()
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

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Showcase', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set up fake timers
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading skeleton when data is being fetched', () => {
    // Mock loading state
    (useShowcase as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    // Mock other required hooks
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: true,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });

    render(<Showcase />);

    // Check for the showcase container
    const container = screen.getByTestId('showcase-skeleton');
    expect(container).toBeInTheDocument();

    // Check for skeleton title placeholders
    const titleSkeletons = screen.getAllByTestId('title-skeleton');
    expect(titleSkeletons.length).toBeGreaterThan(0);

    // Check for belt items skeleton (4 items)
    const beltItems = screen.getAllByTestId('belt-item-skeleton');
    expect(beltItems.length).toBe(4);
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load showcase content');
    
    (useShowcase as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });

    render(<Showcase />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load showcase content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);
  });

  it('renders main content correctly when data is loaded', () => {
    // Mock successful data fetch
    const mockData = {
      data: {
        belts: [
          {
            id: 1,
            title: "Test Belt",
            description: "Test Description",
            images: [
              {
                id: 1,
                alt: "Test Image",
                img: {
                  formats: {
                    thumbnail: {
                      url: "/test-image.jpg"
                    }
                  }
                }
              }
            ]
          }
        ]
      }
    };

    (useShowcase as any).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });

    render(<Showcase />);

    // Check main content elements
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Unveil New Creative Horizons/i);
    
    // Check navigation buttons
    const prevButton = screen.getByRole('button', { name: /previous showcase/i });
    const nextButton = screen.getByRole('button', { name: /next showcase/i });
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Check belt item content
    expect(screen.getByText('Test Belt')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    
    // Check image
    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('/test-image.jpg'));
  });

  it('preloads images when component mounts', async () => {
    const preloadImagesMock = vi.fn().mockResolvedValue(undefined);
    const startLoadingMock = vi.fn();
    
    // Mock successful data fetch with multiple images
    const mockData = {
      data: {
        belts: [
          {
            id: 1,
            title: "Test Belt",
            description: "Test Description",
            images: [
              {
                id: 1,
                alt: "Test Image 1",
                img: { formats: { thumbnail: { url: "/image1.jpg" } } }
              },
              {
                id: 2,
                alt: "Test Image 2",
                img: { formats: { thumbnail: { url: "/image2.jpg" } } }
              }
            ]
          }
        ]
      }
    };

    (useShowcase as any).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    (useImagePreloader as any).mockReturnValue({
      preloadImages: preloadImagesMock,
      isPreloading: false
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: startLoadingMock,
      stopLoading: vi.fn()
    });

    render(<Showcase />);

    // Verify preloadImages was called with the correct URLs
    expect(preloadImagesMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('/image1.jpg'),
        expect.stringContaining('/image2.jpg')
      ])
    );
    expect(startLoadingMock).toHaveBeenCalled();
  });
}); 