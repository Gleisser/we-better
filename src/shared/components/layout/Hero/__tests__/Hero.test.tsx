import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../Hero';
import { useHero } from '@/shared/hooks/useHero';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { HERO_FALLBACK } from '@/utils/constants/fallback';
import type { Hero as HeroType, HeroResponse } from '@/utils/types/hero';

vi.mock('@/shared/hooks/useHero', () => ({
  useHero: vi.fn(),
}));

vi.mock('@/shared/hooks/utils/useErrorHandler', () => ({
  useErrorHandler: vi.fn(),
}));

const mockedUseHero = vi.mocked(useHero);
const mockedUseErrorHandler = vi.mocked(useErrorHandler);

const createHeroResponse = (hero: Partial<HeroType> = {}): HeroResponse => ({
  data: {
    id: 1,
    documentId: 'hero-1',
    title: 'Welcome to We Better',
    subtitle: 'Create stunning visuals',
    cta_text: 'Get Started',
    secondary_cta_text: 'Learn More',
    main_image: {
      id: 1,
      documentId: 'img-1',
      src: '/api-image.webp',
      alt: 'We Better Dashboard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      img: {
        id: 10,
        documentId: 'img-1-file',
        name: 'api-image.webp',
        alternativeText: null,
        caption: null,
        width: 1200,
        height: 800,
        formats: null,
        hash: 'api-image',
        ext: '.webp',
        mime: 'image/webp',
        size: 100,
        url: '/api-image.webp',
        previewUrl: null,
        provider: 'local',
        provider_metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    },
    main_image_mobile: {
      id: 2,
      documentId: 'img-2',
      src: '/api-image-mobile.webp',
      alt: 'We Better Mobile Dashboard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      img: {
        id: 11,
        documentId: 'img-2-file',
        name: 'api-image-mobile.webp',
        alternativeText: null,
        caption: null,
        width: 800,
        height: 1200,
        formats: null,
        hash: 'api-image-mobile',
        ext: '.webp',
        mime: 'image/webp',
        size: 80,
        url: '/api-image-mobile.webp',
        previewUrl: null,
        provider: 'local',
        provider_metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    },
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    ...hero,
  },
  meta: {
    pagination: {
      page: 1,
      pageSize: 1,
      pageCount: 1,
      total: 1,
    },
  },
});

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    mockedUseHero.mockReturnValue({
      data: createHeroResponse({
        title: HERO_FALLBACK.title,
        subtitle: HERO_FALLBACK.subtitle,
        cta_text: HERO_FALLBACK.cta_text,
        secondary_cta_text: HERO_FALLBACK.secondary_cta_text,
        main_image: {
          ...createHeroResponse().data.main_image,
          src: HERO_FALLBACK.main_image.src,
          alt: HERO_FALLBACK.main_image.alt,
        },
        main_image_mobile: {
          ...createHeroResponse().data.main_image_mobile,
          src: HERO_FALLBACK.main_image_mobile.src,
          alt: HERO_FALLBACK.main_image_mobile.alt,
        },
        images: HERO_FALLBACK.images.map((image, index) => ({
          id: index + 10,
          documentId: `floating-${index}`,
          src: image.src,
          alt: image.alt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          img: {
            id: index + 20,
            documentId: `floating-file-${index}`,
            name: `floating-${index}.webp`,
            alternativeText: null,
            caption: null,
            width: 400,
            height: 400,
            formats: null,
            hash: `floating-${index}`,
            ext: '.webp',
            mime: 'image/webp',
            size: 40,
            url: image.src,
            previewUrl: null,
            provider: 'local',
            provider_metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
          },
        })),
      }),
      isFetching: false,
    } as ReturnType<typeof useHero>);
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
  });

  it('shows the loading skeleton first and falls back to static content after 1 second', () => {
    vi.useFakeTimers();
    mockedUseHero.mockReturnValue({
      data: null,
      isFetching: true,
    } as ReturnType<typeof useHero>);

    render(<Hero />);

    expect(screen.queryByTestId('hero-skeleton')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole('heading', { level: 1, name: HERO_FALLBACK.title })).not.toBeNull();
    expect(screen.queryByText(HERO_FALLBACK.subtitle)).not.toBeNull();
  });

  it('renders the error state when the error handler reports a failure', () => {
    mockedUseHero.mockReturnValue({
      data: null,
      isFetching: false,
    } as ReturnType<typeof useHero>);
    mockedUseErrorHandler.mockReturnValue({
      isError: true,
      error: {
        hasError: true,
        message: 'Failed to fetch hero data',
        code: 'hero_fetch_failed',
        timestamp: Date.now(),
      },
      handleError: vi.fn(),
      clearError: vi.fn(),
    });

    render(<Hero />);

    expect(screen.queryByRole('alert')).not.toBeNull();
    expect(screen.queryByText('Failed to fetch hero data')).not.toBeNull();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeNull();
  });

  it('renders the mobile preview when the viewport is 768px wide or smaller', () => {
    window.innerWidth = 767;
    mockedUseHero.mockReturnValue({
      data: createHeroResponse({
        title: 'Mobile Hero',
        main_image_mobile: {
          ...createHeroResponse().data.main_image_mobile,
          src: '/mobile-hero-image.webp',
          alt: 'We Better Mobile Dashboard',
        },
      }),
      isFetching: false,
    } as ReturnType<typeof useHero>);

    render(<Hero />);

    const mobileImage = screen.getByAltText('We Better Mobile App Interface');
    expect(mobileImage).not.toBeNull();
    expect(screen.queryByRole('group', { name: /call to action/i })).not.toBeNull();
  });

  it('renders API content when hero data loads successfully', () => {
    const apiHero = createHeroResponse({
      title: 'Welcome to We Better',
      subtitle: 'Create stunning visuals',
      cta_text: 'Get Started',
      secondary_cta_text: 'Learn More',
    });

    mockedUseHero.mockReturnValue({
      data: apiHero,
      isFetching: false,
    } as ReturnType<typeof useHero>);

    render(<Hero />);

    expect(screen.queryByRole('heading', { level: 1, name: apiHero.data.title })).not.toBeNull();
    expect(screen.queryByText(apiHero.data.subtitle)).not.toBeNull();
    expect(screen.queryByRole('button', { name: apiHero.data.cta_text })).not.toBeNull();
    expect(screen.queryByRole('button', { name: apiHero.data.secondary_cta_text })).not.toBeNull();
  });

  it('renders floating images with lazy loading on desktop', () => {
    const apiHero = createHeroResponse({
      main_image: {
        ...createHeroResponse().data.main_image,
        src: '/preload-main.webp',
      },
      images: [
        {
          ...createHeroResponse().data.main_image,
          id: 3,
          documentId: 'floating-1',
          src: '/floating-1.webp',
          alt: 'Floating 1',
        },
        {
          ...createHeroResponse().data.main_image,
          id: 4,
          documentId: 'floating-2',
          src: '/floating-2.webp',
          alt: 'Floating 2',
        },
      ],
    });

    mockedUseHero.mockReturnValue({
      data: apiHero,
      isFetching: false,
    } as ReturnType<typeof useHero>);

    const { container } = render(<Hero />);
    const lazyImages = Array.from(container.querySelectorAll('img[loading="lazy"]'));

    expect(lazyImages).toHaveLength(2);
    expect(lazyImages.map(image => image.getAttribute('src'))).toEqual([
      '/floating-1.webp',
      '/floating-2.webp',
    ]);
  });
});
