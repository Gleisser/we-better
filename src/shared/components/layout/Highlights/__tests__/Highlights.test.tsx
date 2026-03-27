import '@testing-library/jest-dom/vitest';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Highlights from '../Highlights';
import { useHighlight } from '@/shared/hooks/useHighlight';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';

vi.mock('@/shared/hooks/useHighlight', () => ({
  useHighlight: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseHighlight = vi.mocked(useHighlight);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);
const observeMock = vi.fn();

describe('Highlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    mockedUseHighlight.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useHighlight>);
    mockedUseErrorHandler.mockReturnValue({
      isError: false,
      error: null,
    } as ReturnType<typeof useErrorHandler>);

    window.IntersectionObserver = vi.fn(callback => {
      callback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
      return {
        observe: observeMock,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: () => [],
      };
    }) as unknown as typeof IntersectionObserver;
  });

  it('loads only the active and adjacent highlight slides after section visibility', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const { container } = render(<Highlights />);

    const images = Array.from(container.querySelectorAll('img'));
    const loadedImages = images.filter(
      image => !(image.getAttribute('src') ?? '').includes('data:image/gif')
    );
    const getActiveSlideAlt = (): string | null =>
      container.querySelector('[role="tabpanel"][aria-hidden="false"] img')?.getAttribute('alt') ??
      null;

    expect(loadedImages).toHaveLength(2);
    expect(getActiveSlideAlt()).toContain('Goals');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(getActiveSlideAlt()).toContain('Relationships');
    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });

  it('attaches the observer after the skeleton swaps to fallback content', () => {
    mockedUseHighlight.mockReturnValue({
      data: null,
      isLoading: true,
    } as ReturnType<typeof useHighlight>);

    const { container } = render(<Highlights />);

    expect(observeMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(observeMock).toHaveBeenCalledTimes(1);

    const images = Array.from(container.querySelectorAll('img'));
    expect(images[0]?.getAttribute('src') ?? '').not.toContain('data:image/gif');
  });

  it('pauses autoplay when the page is hidden', () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    const { container } = render(<Highlights />);
    const getActiveSlideAlt = (): string | null =>
      container.querySelector('[role="tabpanel"][aria-hidden="false"] img')?.getAttribute('alt') ??
      null;

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      vi.advanceTimersByTime(4000);
    });

    expect(getActiveSlideAlt()).toContain('Goals');
  });
});
