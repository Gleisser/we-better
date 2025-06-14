import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Community from '../Community';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import styles from '../Community.module.css';

// Mock the hooks
vi.mock('@/hooks/useCommunity', () => ({
  useCommunity: vi.fn()
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

describe('Community', () => {
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state when data is being fetched', () => {
    // Mock loading state
    (useCommunity as any).mockReturnValue({
      data: null,
      isLoading: true
    });

    // Mock error handler
    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    render(<Community />);

    // Check if loading message is displayed
    const loadingElement = screen.getByText(/Loading community content/i);
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error state when there is an error fetching data', () => {
    // Mock error state
    const mockError = new Error('Failed to load community content');
    
    (useCommunity as any).mockReturnValue({
      data: null,
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: true,
      error: mockError,
      handleError: vi.fn()
    });

    render(<Community />);

    // Check if error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load community content/i)).toBeInTheDocument();
    
    // Verify retry button is present and accessible
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass(styles.retryButton);

    // Verify community content is not shown
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('preloads profile images when component mounts', async () => {
    const preloadImagesMock = vi.fn().mockResolvedValue(undefined);
    const startLoadingMock = vi.fn();
    const stopLoadingMock = vi.fn();

    // Mock successful data fetch
    (useCommunity as any).mockReturnValue({
      data: {
        data: {
          label: '#3 Discord Server in the World',
          title: 'Join our creative community!',
          buttonText: 'Join Discord Server'
        }
      },
      isLoading: false
    });

    (useImagePreloader as any).mockReturnValue({
      preloadImages: preloadImagesMock,
      isPreloading: false
    });

    (useLoadingState as any).mockReturnValue({
      isLoading: false,
      startLoading: startLoadingMock,
      stopLoading: stopLoadingMock
    });

    render(<Community />);

    // Verify image preloading was triggered
    expect(preloadImagesMock).toHaveBeenCalled();
    expect(startLoadingMock).toHaveBeenCalled();
    
    // Verify the correct profile image URLs were passed
    const calledUrls = preloadImagesMock.mock.calls[0][0];
    expect(calledUrls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/assets/images/community/list-1.webp'),
        expect.stringContaining('/assets/images/community/list-2.webp')
      ])
    );

    // Wait for the async operation to complete
    await vi.advanceTimersByTimeAsync(0);

    // Verify loading state management
    expect(stopLoadingMock).toHaveBeenCalled();
  });

  it('renders main content correctly when data is loaded', () => {
    // Mock successful data fetch
    (useCommunity as any).mockReturnValue({
      data: {
        data: {
          label: 'Top Discord Server',
          title: 'Join our *creative* community!',
          buttonText: 'Join Our Discord'
        }
      },
      isLoading: false
    });

    (useErrorHandler as any).mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn()
    });

    render(<Community />);

    // Check Discord label
    const discordLabel = screen.getByLabelText('Discord server ranking');
    expect(discordLabel).toBeInTheDocument();
    expect(discordLabel).toHaveTextContent('Top Discord Server');

    // Check title content - just verify the main text is present
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(/creative/i);
    expect(title).toHaveTextContent(/community/i);

    // Check Discord button
    const discordButton = screen.getByRole('link', { name: /join our discord/i });
    expect(discordButton).toBeInTheDocument();
    expect(discordButton).toHaveAttribute('href', 'https://discord.gg/webetter');
    expect(discordButton).toHaveAttribute('target', '_blank');
    expect(discordButton).toHaveAttribute('rel', 'noopener noreferrer');

    // Check profile images are present
    const profileContainer = screen.getByRole('presentation');
    expect(profileContainer).toBeInTheDocument();
    expect(profileContainer).toHaveClass(styles.rightColumn);

    // Verify profile images are rendered
    const profileImages = screen.getAllByAltText(/Community member profile/i);
    expect(profileImages.length).toBeGreaterThan(0);
    
    // Check attributes of first profile image as representative
    const firstImage = profileImages[0];
    expect(firstImage).toHaveAttribute('loading', 'lazy');
    expect(firstImage).toHaveAttribute('decoding', 'async');
    expect(firstImage).toHaveAttribute('src', expect.stringContaining('/assets/images/community/list-'));
  });
}); 