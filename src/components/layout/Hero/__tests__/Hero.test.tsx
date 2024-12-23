import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Hero } from '../Hero';
import { useHero } from '@/hooks/useHero';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';
import { HERO_FALLBACK } from '@/constants/fallback';

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
}); 