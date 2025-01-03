import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Testimonies from '../Testimonies';
import { useTestimony } from '@/hooks/useTestimony';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';
import { TESTIMONY_FALLBACK } from '@/constants/fallback';
import styles from '../Testimonies.module.css';
import { API_CONFIG } from '@/lib/api-config';

// Mock the hooks
vi.mock('@/hooks/useTestimony');
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

describe('Testimonies', () => {
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
    vi.useRealTimers();
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (useTestimony as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    render(<Testimonies />);

    // Check if loading message is displayed
    const loadingElement = screen.getByText(/Loading testimonials/i);
    expect(loadingElement).toBeInTheDocument();
    
    // Verify ARIA attributes for accessibility
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load testimonials');
    
    (useTestimony as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Testimonies />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load testimonials/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);

    // Verify testimonials content is not shown
    expect(screen.queryByRole('region', { name: /user testimonials/i })).not.toBeInTheDocument();
  });

  it('preloads profile images when component mounts', async () => {
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

    // Mock successful data fetch with profile pictures
    const mockTestimonies = [
      {
        id: 1,
        username: "Test User 1",
        testimony: "Great experience!",
        profilePic: {
          url: '/profile1.jpg'
        }
      },
      {
        id: 2,
        username: "Test User 2",
        testimony: "Amazing platform!",
        profilePic: {
          url: '/profile2.jpg'
        }
      }
    ];

    (useTestimony as any).mockReturnValue({
      data: {
        data: {
          testimonies: mockTestimonies,
          title: "User Testimonials",
          subtitle: "What our users say"
        }
      },
      isLoading: false
    });

    render(<Testimonies />);

    // Verify image preloading was triggered
    expect(preloadImagesMock).toHaveBeenCalled();
    expect(startLoadingMock).toHaveBeenCalled();
    
    // Verify the correct profile picture URLs were passed
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    mockTestimonies.forEach(testimony => {
      expect(calledUrls).toContain(API_CONFIG.imageBaseURL + testimony.profilePic.url);
    });

    // Wait for the async operation to complete
    await vi.advanceTimersByTimeAsync(0);

    // Verify loading state management
    expect(stopLoadingMock).toHaveBeenCalled();
  });

  it('renders testimonials content correctly with actual data', () => {
    // Reset error handler to ensure no error state is shown
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    // Mock successful data fetch with custom content
    const mockData = {
      data: {
        testimonies: [
          {
            id: 1,
            username: "John Doe",
            testimony: "This is a great platform!",
            profilePic: {
              url: '/profile1.jpg'
            }
          }
        ],
        title: "Custom Testimonials Title",
        subtitle: "What our users are saying"
      }
    };

    (useTestimony as any).mockReturnValue({
      data: mockData,
      isLoading: false
    });

    render(<Testimonies />);

    // Check title and subtitle
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Custom Testimonials Title');
    expect(screen.getByText('What our users are saying')).toBeInTheDocument();

    // Check testimonial content
    const testimonialRegion = screen.getByRole('region', { name: /user testimonials/i });
    expect(testimonialRegion).toBeInTheDocument();

    // Check individual testimonial
    const testimonialCard = screen.getByRole('article');
    expect(testimonialCard).toBeInTheDocument();
    expect(screen.getByText('"This is a great platform!"')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check profile image
    const profileImage = screen.getByAltText('John Doe');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', expect.stringContaining('/profile1.jpg'));
    expect(profileImage).toHaveAttribute('loading', 'lazy');
    expect(profileImage).toHaveAttribute('decoding', 'async');
  });
}); 