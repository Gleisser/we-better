import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Gallery from '../Gallery';
import { useGallery } from '@/shared/hooks/useGallery';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useGallery', () => ({
  useGallery: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseGallery = vi.mocked(useGallery);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

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
});
