import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Gallery.module.css';
import { useGallery } from '@/shared/hooks/useGallery';
import { API_CONFIG } from '@/core/config/api-config';
import { GalleryIcon, MobileNavIcon, MobileNavNextIcon } from '@/shared/components/common/icons';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { TopLevelImage } from '@/utils/types/common/image';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';
import { createResponsiveMediaFromImage } from '@/utils/helpers/responsiveMedia';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';
import type { ResponsiveMediaSource } from '@/utils/types/responsiveMedia';

const INITIAL_LOAD = 12;
const LOAD_MORE_COUNT = 8;

type GalleryImage = {
  id: number;
  alt: string;
  size: 'small' | 'large';
  media: ResponsiveMediaSource;
};

const getGalleryImageAlt = (
  image: Pick<TopLevelImage, 'alternativeText' | 'name' | 'id'>
): string => image.alternativeText?.trim() || image.name?.trim() || `Gallery image ${image.id}`;

const GALLERY_IMAGES = [
  {
    id: 1,
    media: LANDING_MEDIA.galleryFallbacks.body,
    alt: LANDING_MEDIA.galleryFallbacks.body.alt,
    size: 'large',
  },
  {
    id: 2,
    media: LANDING_MEDIA.galleryFallbacks.mind,
    alt: LANDING_MEDIA.galleryFallbacks.mind.alt,
    size: 'large',
  },
  {
    id: 3,
    media: LANDING_MEDIA.galleryFallbacks.gallery4,
    alt: LANDING_MEDIA.galleryFallbacks.gallery4.alt,
    size: 'small',
  },
  {
    id: 4,
    media: LANDING_MEDIA.galleryFallbacks.family,
    alt: LANDING_MEDIA.galleryFallbacks.family.alt,
    size: 'large',
  },
  {
    id: 5,
    media: LANDING_MEDIA.galleryFallbacks.care,
    alt: LANDING_MEDIA.galleryFallbacks.care.alt,
    size: 'large',
  },
  {
    id: 6,
    media: LANDING_MEDIA.galleryFallbacks.career,
    alt: LANDING_MEDIA.galleryFallbacks.career.alt,
    size: 'large',
  },
  {
    id: 7,
    media: LANDING_MEDIA.galleryFallbacks.spirit,
    alt: LANDING_MEDIA.galleryFallbacks.spirit.alt,
    size: 'large',
  },
  {
    id: 8,
    media: LANDING_MEDIA.galleryFallbacks.gallery1,
    alt: LANDING_MEDIA.galleryFallbacks.gallery1.alt,
    size: 'small',
  },
  {
    id: 9,
    media: LANDING_MEDIA.galleryFallbacks.gallery2,
    alt: LANDING_MEDIA.galleryFallbacks.gallery2.alt,
    size: 'small',
  },
  {
    id: 10,
    media: LANDING_MEDIA.galleryFallbacks.gallery3,
    alt: LANDING_MEDIA.galleryFallbacks.gallery3.alt,
    size: 'small',
  },
  {
    id: 11,
    media: LANDING_MEDIA.galleryFallbacks.gallery5,
    alt: LANDING_MEDIA.galleryFallbacks.gallery5.alt,
    size: 'small',
  },
  {
    id: 12,
    media: LANDING_MEDIA.galleryFallbacks.gallery6,
    alt: LANDING_MEDIA.galleryFallbacks.gallery6.alt,
    size: 'small',
  },
] as const;

const BODY_IMAGE_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const isBodyMotionImage = (image: GalleryImage): boolean =>
  image.media.src === LANDING_MEDIA.galleryFallbacks.body.src ||
  image.alt.toLowerCase().includes('running');

const Gallery = (): JSX.Element => {
  // State management
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const bodyMotionStageRef = useRef<HTMLDivElement | null>(null);

  // Initialize hooks
  const { data, isLoading: isDataLoading } = useGallery();
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load gallery content',
  });

  // Process images data
  const images = data?.data?.images.map((image: TopLevelImage) => {
    const alt = getGalleryImageAlt(image);

    return {
      id: image.id,
      alt,
      size: (image.height > 400 ? 'large' : 'small') as 'large' | 'small',
      media:
        createResponsiveMediaFromImage(
          {
            ...image,
            src: `${API_CONFIG.imageBaseURL}${image.url}`,
            alt,
          },
          {
            alt,
            sizes:
              image.height > 400
                ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                : '(max-width: 768px) 50vw, 25vw',
          }
        ) ?? LANDING_MEDIA.galleryFallbacks.mind,
    };
  });

  // Image ordering logic
  const orderImages = useCallback((images: GalleryImage[] | undefined) => {
    if (!images) return [];

    const orderedImages: GalleryImage[] = [];
    const smallImages = images.filter(image => image.size === 'small');
    const largeImages = images.filter(image => image.size === 'large');

    while (smallImages?.length > 0 && largeImages?.length > 0) {
      const nextLarge = largeImages.shift();
      const nextSmall = smallImages.shift();
      if (nextLarge) orderedImages.push(nextLarge);
      if (nextSmall) orderedImages.push(nextSmall);
    }

    return [...orderedImages, ...largeImages, ...smallImages];
  }, []);

  const orderedImages = orderImages(images);
  const galleryImages = orderedImages?.length > 0 ? orderedImages : GALLERY_IMAGES;
  const visibleImages = galleryImages.slice(0, visibleCount);
  const shouldRenderGallery = !isDataLoading && !isError;

  // Intersection Observer setup
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              if (img.dataset.sizes) {
                img.sizes = img.dataset.sizes;
              }
              img.removeAttribute('data-src');
              img.removeAttribute('data-srcset');
              img.removeAttribute('data-sizes');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    imageRefs.current.forEach(imageRef => {
      if (imageRef) {
        observerRef.current?.observe(imageRef);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [visibleImages]);

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (!shouldRenderGallery) {
      return;
    }

    const bodyMotionStage = bodyMotionStageRef.current;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!bodyMotionStage) {
      return;
    }

    if (isMobile || prefersReducedMotion) {
      bodyMotionStage.style.setProperty('--gallery-body-pan-progress', '1');
      return;
    }

    let rafId = 0;

    const updateBodyPan = (): void => {
      rafId = 0;

      const section = sectionRef.current;

      if (!section || !bodyMotionStageRef.current) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.95;
      const end = viewportHeight * 0.2;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

      bodyMotionStageRef.current.style.setProperty(
        '--gallery-body-pan-progress',
        progress.toFixed(3)
      );
    };

    const requestBodyPanUpdate = (): void => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(updateBodyPan);
    };

    requestBodyPanUpdate();
    window.addEventListener('scroll', requestBodyPanUpdate, { passive: true });
    window.addEventListener('resize', requestBodyPanUpdate);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', requestBodyPanUpdate);
      window.removeEventListener('resize', requestBodyPanUpdate);
    };
  }, [isMobile, shouldRenderGallery, visibleImages]);

  // Navigation handlers
  const hasMore = visibleCount < galleryImages.length;

  const handleLoadMore = (): void => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, galleryImages.length));
  };

  const nextImage = (): void => {
    setCurrentMobileIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (): void => {
    setCurrentMobileIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  // Show loading state only during initial data fetch
  if (isDataLoading) {
    return (
      <section className={styles.galleryContainer}>
        <div className={styles.galleryContent}>
          <div className={styles.loadingState} aria-busy="true">
            Loading gallery...
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.galleryContainer}>
        <div className={styles.galleryContent}>
          <div className={styles.errorState} role="alert">
            <p>{error?.message}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={styles.galleryContainer} aria-labelledby="gallery-title">
      <div className={styles.galleryContent}>
        <div className={styles.header}>
          <h2 className={styles.title} id="gallery-title">
            <span className={styles.gradientText}>{data?.data?.Title || 'Curated Content'}</span>{' '}
            {data?.data?.highlightedTitle}
            <GalleryIcon className={styles.paintIcon} aria-hidden="true" />
          </h2>
        </div>

        {isMobile ? (
          <div
            className={styles.mobileGallery}
            role="region"
            aria-label="Mobile gallery navigation"
          >
            <button
              onClick={prevImage}
              className={`${styles.mobileNavButton} ${styles.prevButton}`}
              aria-label="Previous image"
            >
              <MobileNavIcon className={styles.navIcon} aria-hidden="true" />
            </button>

            <div className={styles.mobileImageContainer}>
              <ResponsiveImage
                media={
                  galleryImages[currentMobileIndex]?.media ?? LANDING_MEDIA.galleryFallbacks.mind
                }
                ref={el => (imageRefs.current[currentMobileIndex] = el)}
                alt={galleryImages[currentMobileIndex]?.alt}
                className={styles.mobileImage}
                loading="lazy"
              />
            </div>

            <button
              onClick={nextImage}
              className={`${styles.mobileNavButton} ${styles.nextButton}`}
              aria-label="Next image"
            >
              <MobileNavNextIcon className={styles.navIcon} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <div className={styles.masonryGrid} role="region" aria-label="Gallery grid">
              {visibleImages.map((image, index) => (
                <div
                  key={image?.id}
                  className={`${styles.masonryItem} ${styles[image?.size || 'large']}`}
                  role="img"
                  aria-label={image?.alt}
                >
                  {isBodyMotionImage(image) ? (
                    <div
                      ref={el => {
                        bodyMotionStageRef.current = el;
                      }}
                      className={styles.bodyMotionStage}
                      data-body-motion="true"
                    >
                      <img
                        ref={el => (imageRefs.current[index] = el)}
                        src={BODY_IMAGE_PLACEHOLDER}
                        data-src={image?.media.src}
                        data-srcset={image?.media.srcSet}
                        data-sizes={image?.media.sizes}
                        alt={image?.alt}
                        className={`${styles.image} ${styles.bodyBackgroundImage}`}
                        loading="lazy"
                        decoding="async"
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.currentSrc || image?.media.src || '';
                          const stage = bodyMotionStageRef.current ?? target.parentElement;
                          if (stage) {
                            stage.style.setProperty(
                              '--gallery-body-image',
                              `url("${currentSrc.replace(/"/g, '\\"')}")`
                            );
                            stage.setAttribute('data-layer-ready', 'true');
                          }
                        }}
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = image?.media.src || '';
                        }}
                      />
                      <div className={styles.bodyRunnerLayer} aria-hidden="true" />
                    </div>
                  ) : (
                    <img
                      ref={el => (imageRefs.current[index] = el)}
                      src={BODY_IMAGE_PLACEHOLDER}
                      data-src={image?.media.src}
                      data-srcset={image?.media.srcSet}
                      data-sizes={image?.media.sizes}
                      alt={image?.alt}
                      className={styles.image}
                      loading="lazy"
                      decoding="async"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = image?.media.src || '';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={handleLoadMore}
                  className={styles.loadMoreButton}
                  aria-label="Load more images"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Gallery;
