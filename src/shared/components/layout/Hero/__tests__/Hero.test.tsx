import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Hero } from '../Hero';
import { useHero } from '@/shared/hooks/useHero';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { HERO_FALLBACK } from '@/utils/constants/fallback';
import styles from '../Hero.module.css';
import type { Hero as HeroType } from '@/types/hero';

// Mock the hooks
vi.mock('@/hooks/useHero');
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

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Hero', () => {
  beforeEach(() => {
    // Mock default hook implementations
    (useHero as any).mockReturnValue({
      data: {
        data: HERO_FALLBACK
      },
      isFetching: false
    });

    (useImagePreloader as any).mockReturnValue({
      preloadImages: vi.fn().mockResolvedValue(undefined)
    });

    // Reset error handler mock
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    // Reset loading state mock
    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: vi.fn(),
      stopLoading: vi.fn()
    });

    // Reset window innerWidth
    window.innerWidth = 1024;
  });

  it('renders hero section with fallback content when data is loading', async () => {
    // Mock loading state
    (useHero as any).mockReturnValue({
      data: null,
      isFetching: true
    });

    render(<Hero />);

    // Initially should show loading skeleton
    expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument();

    // After timeout, should show fallback content
    await waitFor(() => {
      expect(screen.getByText(HERO_FALLBACK.title)).toBeInTheDocument();
      expect(screen.getByText(HERO_FALLBACK.subtitle)).toBeInTheDocument();
      expect(screen.getByText(HERO_FALLBACK.cta_text)).toBeInTheDocument();
      expect(screen.getByText(HERO_FALLBACK.secondary_cta_text)).toBeInTheDocument();
    }, { timeout: 1100 });
  });

  it('renders error state when there is an error fetching data', async () => {
    // Mock error state
    const mockError = new Error('Failed to fetch hero data');
    
    (useHero as any).mockReturnValue({
      data: null,
      isFetching: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Hero />);

    // Should show error message
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch hero data/i)).toBeInTheDocument();
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('renders mobile version when screen width is below 768px', async () => {
    // Mock window width to mobile size
    window.innerWidth = 767;
    
    // Mock successful data fetch with mobile image
    const mockHeroData = {
      ...HERO_FALLBACK,
      main_image_mobile: {
        src: '/mobile-hero-image.webp',
        alt: 'We Better Mobile App Interface'
      }
    };
    
    (useHero as any).mockReturnValue({
      data: {
        data: mockHeroData
      },
      isFetching: false
    });

    render(<Hero />);

    // Should render mobile image instead of desktop dashboard preview
    const mobileImage = screen.getByAltText('We Better Mobile App Interface');
    expect(mobileImage).toBeInTheDocument();
    expect(mobileImage).toHaveAttribute('class');
    expect(mobileImage.className).toMatch(/mobilePreviewImage/);

    // Should maintain responsive layout elements
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /call to action/i })).toBeInTheDocument();

    // Verify floating images are still present
    const floatingImages = screen.getAllByRole('presentation');
    expect(floatingImages.length).toBeGreaterThan(0);
  });

  it('renders with actual API data when fetch is successful', () => {
    const mockApiData: HeroType = {
      id: 1,
      documentId: 'hero-1',
      title: "Welcome to We Better",
      subtitle: "Create stunning visuals",
      cta_text: "Get Started",
      secondary_cta_text: "Learn More",
      main_image: {
        id: 1,
        documentId: 'img-1',
        src: "/api-image.webp",
        alt: "We Better Dashboard",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      main_image_mobile: {
        id: 2,
        documentId: 'img-2',
        src: "/api-image-mobile.webp",
        alt: "We Better Mobile Dashboard",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };

    (useHero as any).mockReturnValue({
      data: { data: mockApiData },
      isFetching: false
    });

    render(<Hero />);

    expect(screen.getByText(mockApiData.title)).toBeInTheDocument();
    expect(screen.getByText(mockApiData.subtitle)).toBeInTheDocument();
    expect(screen.getByText(mockApiData.cta_text)).toBeInTheDocument();
  });

  it('preloads images when component mounts', async () => {
    const preloadImagesMock = vi.fn().mockResolvedValue(undefined);
    (useImagePreloader as any).mockReturnValue({
      preloadImages: preloadImagesMock
    });

    render(<Hero />);

    expect(preloadImagesMock).toHaveBeenCalled();
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    expect(calledUrls).toContain(HERO_FALLBACK.main_image.src);
  });

  it('shows loading state while preloading images', () => {
    const startLoadingMock = vi.fn();
    const stopLoadingMock = vi.fn();

    (useLoadingState as any).mockReturnValue({
      isLoading: true,
      startLoading: startLoadingMock,
      stopLoading: stopLoadingMock
    });

    render(<Hero />);

    expect(startLoadingMock).toHaveBeenCalled();
    expect(stopLoadingMock).not.toHaveBeenCalled();
  });
}); 