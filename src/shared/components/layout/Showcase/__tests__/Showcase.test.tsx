import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Showcase from '../Showcase';
import { useShowcase } from '@/shared/hooks/useShowcase';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useShowcase', () => ({
  useShowcase: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      custom,
      drag,
      dragConstraints,
      dragElastic,
      initial,
      animate,
      exit,
      transition,
      variants,
      whileDrag,
      ...props
    }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockedUseShowcase = vi.mocked(useShowcase);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

describe('Showcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockedUseShowcase.mockReturnValue({
      data: {
        data: {
          title: 'Unlock Your Growth Journey with',
          subtitle: 'Tailored Resources',
          belts: [
            {
              id: 1,
              documentId: 'belt-1',
              title: 'Tracking',
              description: 'Description for tracking',
              images: [
                { src: '/belt-one-1.jpg', alt: 'Tracking 1' },
                { src: '/belt-one-2.jpg', alt: 'Tracking 2' },
              ],
            },
            {
              id: 2,
              documentId: 'belt-2',
              title: 'E-Books',
              description: 'Description for ebooks',
              images: [{ src: '/belt-two-1.jpg', alt: 'E-Books 1' }],
            },
          ],
        },
      },
      isLoading: false,
    } as ReturnType<typeof useShowcase>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);

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

  it('renders visible showcase cards with native image loading', () => {
    render(<Showcase />);

    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[1]).toHaveAttribute('loading', 'lazy');
    expect(images[0].getAttribute('src') ?? '').toContain('/belt-one-1.jpg');
  });

  it('keeps hover rotation scoped to the hovered card', () => {
    render(<Showcase />);

    const [firstCard] = screen.getAllByRole('article');
    fireEvent.mouseEnter(firstCard);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const images = screen.getAllByRole('img');
    expect(images[0].getAttribute('src') ?? '').toContain('/belt-one-2.jpg');
    expect(images[1].getAttribute('src') ?? '').toContain('/belt-two-1.jpg');
  });
});
