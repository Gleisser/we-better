import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Gallery from '../Gallery';
import { useGallery } from '@/shared/hooks/useGallery';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import styles from '../Gallery.module.css';

// Mock the hooks
vi.mock('@/hooks/useGallery', () => ({
  useGallery: vi.fn()
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

// Mock API config at the top level
vi.mock('@/lib/api-config', () => ({
  API_CONFIG: {
    imageBaseURL: 'http://test.com'
  }
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Gallery', () => {
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

    // Reset window innerWidth to desktop
    window.innerWidth = 1024;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (useGallery as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    // Mock error handler
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    render(<Gallery />);

    // Check if loading message is displayed
    const loadingElement = screen.getByText(/Loading gallery/i);
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load gallery content');
    
    (useGallery as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Gallery />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load gallery content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);

    // Verify gallery content is not shown
    expect(screen.queryByRole('region', { name: /Gallery grid/i })).not.toBeInTheDocument();
  });

  it('renders desktop view with load more functionality', () => {
    // Use null data to trigger fallback GALLERY_IMAGES
    (useGallery as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    render(<Gallery />);

    // Check for gallery title
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Platform Gallery/i);

    // Check for gallery grid
    const galleryGrid = screen.getByRole('region', { name: /Gallery grid/i });
    expect(galleryGrid).toBeInTheDocument();

    // Check for initial gallery items
    const initialItems = screen.getAllByRole('img');
    const initialCount = initialItems.length;

    // Check for load more button and click it
    const loadMoreButton = screen.getByRole('button', { name: /Load more/i });
    expect(loadMoreButton).toBeInTheDocument();
    fireEvent.click(loadMoreButton);
    
    // Verify more items were added
    const updatedItems = screen.getAllByRole('img');
    expect(updatedItems.length).toBeGreaterThan(initialCount);
  });
}); 