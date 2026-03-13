import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Showcase from '../Showcase';
import { useShowcase } from '@/shared/hooks/useShowcase';
import { useAssetPreload } from '@/shared/hooks/utils/useAssetPreload';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import styles from '../Showcase.module.css';
import type { ThumbnailImage } from '@/utils/types/common/image';
import type { ShowcaseResponse } from '@/utils/types/showcase';

vi.mock('@/shared/hooks/useShowcase', () => ({
  useShowcase: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useAssetPreload', () => ({
  useAssetPreload: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      animate,
      custom,
      drag,
      dragConstraints,
      dragElastic,
      exit,
      initial,
      onDragEnd,
      transition,
      variants,
      whileDrag,
      ...props
    }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockedUseShowcase = vi.mocked(useShowcase);
const mockedUseAssetPreload = vi.mocked(useAssetPreload);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

const createImage = (id: number, src: string, alt: string): ThumbnailImage => ({
  id,
  documentId: `image-${id}`,
  name: alt,
  alternativeText: alt,
  caption: alt,
  width: 600,
  height: 450,
  url: src,
  src,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  alt,
  img: {
    formats: {
      thumbnail: {
        url: src,
        width: 600,
        height: 450,
      },
    },
  },
});

const createShowcaseResponse = (): ShowcaseResponse => ({
  data: {
    id: 1,
    documentId: 'showcase-1',
    title: 'Unlock Your Growth Journey with',
    subtitle: 'Tailored Resources',
    belts: [
      {
        id: 1,
        documentId: 'belt-1',
        title: 'Belt One',
        description: 'Description for belt one',
        images: [
          createImage(101, '/belt-one-1.jpg', 'Belt One Image 1'),
          createImage(102, '/belt-one-2.jpg', 'Belt One Image 2'),
        ],
      },
      {
        id: 2,
        documentId: 'belt-2',
        title: 'Belt Two',
        description: 'Description for belt two',
        images: [
          createImage(201, '/belt-two-1.jpg', 'Belt Two Image 1'),
          createImage(202, '/belt-two-2.jpg', 'Belt Two Image 2'),
        ],
      },
    ],
  },
  meta: {
    pagination: {
      page: 1,
      pageCount: 1,
      pageSize: 1,
      total: 1,
    },
  },
});

describe('Showcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockedUseShowcase.mockReturnValue({
      data: createShowcaseResponse(),
      isLoading: false,
    } as ReturnType<typeof useShowcase>);

    mockedUseAssetPreload.mockReturnValue({
      isLoading: false,
      hasTimedOut: false,
    });

    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
      handleError: vi.fn(),
      clearError: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading skeleton when data is being fetched', () => {
    mockedUseShowcase.mockReturnValue({
      data: null,
      isLoading: true,
    } as ReturnType<typeof useShowcase>);

    render(<Showcase />);

    expect(screen.getByTestId('showcase-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('belt-item-skeleton')).toHaveLength(4);
  });

  it('renders the error state when the error handler reports a failure', () => {
    mockedUseShowcase.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useShowcase>);
    mockedUseErrorHandler.mockReturnValue({
      isError: true,
      error: {
        hasError: true,
        message: 'Failed to load showcase content',
        code: 'showcase_failed',
        timestamp: Date.now(),
      },
      handleError: vi.fn(),
      clearError: vi.fn(),
    });

    render(<Showcase />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load showcase content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toHaveClass(styles.retryButton);
  });

  it('renders showcase content and preloads the current page assets', () => {
    render(<Showcase />);

    expect(screen.getByText('Unlock Your Growth Journey with')).toBeInTheDocument();
    expect(screen.getByText('Tailored Resources')).toBeInTheDocument();
    expect(screen.getByText('Belt One')).toBeInTheDocument();
    expect(screen.getByText('Belt Two')).toBeInTheDocument();
    expect(mockedUseAssetPreload).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        urls: ['/belt-one-1.jpg', '/belt-one-2.jpg', '/belt-two-1.jpg', '/belt-two-2.jpg'],
      })
    );
  });

  it('rotates only the hovered card image and resets it on mouse leave', () => {
    render(<Showcase />);

    const [firstArticle] = screen.getAllByRole('article');
    const initialImages = screen.getAllByRole('img');

    expect(initialImages[0]).toHaveAttribute('src', '/belt-one-1.jpg');
    expect(initialImages[1]).toHaveAttribute('src', '/belt-two-1.jpg');

    fireEvent.mouseEnter(firstArticle);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const rotatedImages = screen.getAllByRole('img');
    expect(rotatedImages[0]).toHaveAttribute('src', '/belt-one-2.jpg');
    expect(rotatedImages[1]).toHaveAttribute('src', '/belt-two-1.jpg');

    fireEvent.mouseLeave(firstArticle);

    const resetImages = screen.getAllByRole('img');
    expect(resetImages[0]).toHaveAttribute('src', '/belt-one-1.jpg');
    expect(resetImages[1]).toHaveAttribute('src', '/belt-two-1.jpg');
  });
});
