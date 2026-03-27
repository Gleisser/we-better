import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Gallery from '../Gallery';
import { useGallery } from '@/shared/hooks/useGallery';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useElementVisibility } from '@/shared/hooks/utils/useElementVisibility';
import { usePageVisibility } from '@/shared/hooks/utils/usePageVisibility';
import { usePrefersReducedMotion } from '@/shared/hooks/utils/usePrefersReducedMotion';
import { subscribeToViewportFrame } from '@/shared/utils/motion/viewportFrameScheduler';

vi.mock('@/shared/hooks/useGallery', () => ({
  useGallery: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useElementVisibility', () => ({
  useElementVisibility: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/usePageVisibility', () => ({
  usePageVisibility: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: vi.fn(),
}));

vi.mock('@/shared/utils/motion/viewportFrameScheduler', () => ({
  subscribeToViewportFrame: vi.fn(),
}));

const mockedUseGallery = vi.mocked(useGallery);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);
const mockedUseElementVisibility = vi.mocked(useElementVisibility);
const mockedUsePageVisibility = vi.mocked(usePageVisibility);
const mockedUsePrefersReducedMotion = vi.mocked(usePrefersReducedMotion);
const mockedSubscribeToViewportFrame = vi.mocked(subscribeToViewportFrame);

const observe = vi.fn();
const disconnect = vi.fn();

describe('Gallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseGallery.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useGallery>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);
    mockedUseElementVisibility.mockReturnValue(true);
    mockedUsePageVisibility.mockReturnValue(true);
    mockedUsePrefersReducedMotion.mockReturnValue(false);
    mockedSubscribeToViewportFrame.mockImplementation(() => vi.fn());

    window.IntersectionObserver = vi.fn(() => ({
      observe,
      unobserve: vi.fn(),
      disconnect,
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: () => [],
    })) as unknown as typeof IntersectionObserver;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });
  });

  it('uses intersection loading for masonry images without gif sources', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const { container } = render(<Gallery />);

    const firstImage = container.querySelector('img[data-src]');
    const bodyMotionLayer = container.querySelector('[data-body-motion="true"]');
    expect(firstImage).not.toBeNull();
    expect(bodyMotionLayer).not.toBeNull();
    expect(firstImage).toHaveAttribute(
      'src',
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    );
    expect(firstImage?.getAttribute('data-src') ?? '').not.toContain('.gif');
    expect(observe).toHaveBeenCalled();
    expect(mockedSubscribeToViewportFrame).toHaveBeenCalledTimes(1);
    expect(addEventListenerSpy.mock.calls.some(([eventName]) => eventName === 'scroll')).toBe(
      false
    );
    addEventListenerSpy.mockRestore();
  });

  it('loads only the active mobile image directly', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 375,
    });

    render(<Gallery />);

    const image = screen.getByRole('img', { name: /woman running/i });
    expect(image.getAttribute('src') ?? '').not.toContain('data:image/gif');
    expect(image).not.toHaveAttribute('data-src');

    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('falls back to a safe alt when cms alternativeText is null', () => {
    mockedUseGallery.mockReturnValue({
      data: {
        data: {
          images: [
            {
              id: 99,
              documentId: 'body-image',
              name: 'Body card',
              alternativeText: null,
              caption: '',
              width: 1080,
              height: 1920,
              url: '/uploads/body-card.webp',
              alt: '',
              src: '',
              createdAt: '',
              updatedAt: '',
              publishedAt: '',
              formats: {
                thumbnail: {
                  url: '/uploads/body-card-thumb.webp',
                  width: 156,
                  height: 278,
                },
              },
            },
          ],
        },
      },
      isLoading: false,
    } as ReturnType<typeof useGallery>);

    render(<Gallery />);

    expect(screen.getAllByAltText('Body card')).toHaveLength(1);
  });

  it('stops the body-pan subscription when motion is gated', () => {
    mockedUsePageVisibility.mockReturnValue(false);

    const { container } = render(<Gallery />);

    const bodyMotionLayer = container.querySelector('[data-body-motion="true"]') as HTMLElement;
    expect(mockedSubscribeToViewportFrame).not.toHaveBeenCalled();
    expect(bodyMotionLayer.style.getPropertyValue('--gallery-body-pan-progress')).toBe('1');
  });
});
