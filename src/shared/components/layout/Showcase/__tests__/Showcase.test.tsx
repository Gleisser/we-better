import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Showcase from '../Showcase';
import { useShowcase } from '@/shared/hooks/useShowcase';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { usePrefersReducedMotion } from '@/shared/hooks/utils/usePrefersReducedMotion';

vi.mock('@/shared/hooks/useShowcase', () => ({
  useShowcase: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: vi.fn(),
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
const mockedUsePrefersReducedMotion = vi.mocked(usePrefersReducedMotion);

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
    mockedUsePrefersReducedMotion.mockReturnValue(false);

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
    const { container } = render(<Showcase />);

    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[0].getAttribute('src') ?? '').toContain('/belt-one-1.jpg');
    expect(images[1]).toHaveAttribute('loading', 'lazy');
    expect(images[1]).toHaveAttribute('aria-hidden', 'true');
    expect(images[1].getAttribute('src') ?? '').toContain('/belt-one-2.jpg');
    expect(images[2].getAttribute('src') ?? '').toContain('/belt-two-1.jpg');
  });

  it('keeps hover previews css-driven without interval rotation', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const { container } = render(<Showcase />);

    const [firstCard] = screen.getAllByRole('article');
    fireEvent.mouseEnter(firstCard);

    const images = Array.from(container.querySelectorAll('img'));
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(images[0].getAttribute('src') ?? '').toContain('/belt-one-1.jpg');
    expect(images[1].getAttribute('src') ?? '').toContain('/belt-one-2.jpg');
    expect(images[2].getAttribute('src') ?? '').toContain('/belt-two-1.jpg');
    setIntervalSpy.mockRestore();
  });

  it('removes hover preview layers when reduced motion is enabled', () => {
    mockedUsePrefersReducedMotion.mockReturnValue(true);

    const { container } = render(<Showcase />);

    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });
});
