import '@testing-library/jest-dom/vitest';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../Hero';
import { useHero } from '@/shared/hooks/useHero';

vi.mock('@/shared/hooks/useHero', () => ({
  useHero: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, initial, animate, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
}));

vi.mock('../Buttons/CtaButton', () => ({
  default: ({ text, ...props }: { text: string }) => <button {...props}>{text}</button>,
}));

vi.mock('../Buttons/SecondaryCtaButton', () => ({
  default: ({ text, ...props }: { text: string }) => <button {...props}>{text}</button>,
}));

const mockedUseHero = vi.mocked(useHero);

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseHero.mockReturnValue({
      data: null,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useHero>);

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1280,
    });
  });

  it('adds only one preload link for the hero LCP image', () => {
    render(<Hero />);

    return waitFor(() => {
      const preloadLinks = document.head.querySelectorAll(
        'link[rel="preload"][data-preload-id="landing-hero-main-image"]'
      );
      expect(preloadLinks).toHaveLength(1);
    });
  });

  it('renders decorative images lazily without gif sources', () => {
    const { container } = render(<Hero />);

    const images = Array.from(container.querySelectorAll('img'));
    const decorativeImages = images.filter(image => image.getAttribute('loading') === 'lazy');
    expect(decorativeImages.length).toBeGreaterThan(0);
    decorativeImages.forEach(image => {
      expect(image.getAttribute('src') ?? '').not.toContain('.gif');
    });
  });
});
