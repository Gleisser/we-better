import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Gallery.module.css';
import { useGallery } from '@/shared/hooks/useGallery';
import { API_CONFIG } from '@/core/config/api-config';
import { GalleryIcon, MobileNavIcon, MobileNavNextIcon } from '@/shared/components/common/icons';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';

const INITIAL_LOAD = 12;
const LOAD_MORE_COUNT = 8;

const GALLERY_IMAGES = [
  {
    id: 1,
    src: '/assets/images/gallery/body.gif',
    alt: 'Woman running',
    size: 'large'
  },
  {
    id: 2,
    src: '/assets/images/gallery/mind.webp',
    alt: 'Woman thinking',
    size: 'large'
  },
  {
    id: 3,
    src: '/assets/images/gallery/gallery_4_small.webp',
    alt: 'Men reading a book',
    size: 'small'
  },
  {
    id: 4,
    src: '/assets/images/gallery/family.webp',
    alt: 'A family of 3',
    size: 'large'
  },
  {
    id: 5,
    src: '/assets/images/gallery/care.webp',
    alt: 'A woman taking care of her self',
    size: 'large'
  },
  {
    id: 6,
    src: '/assets/images/gallery/career.webp',
    alt: 'a man in a suit',
    size: 'large'
  },
  {
    id: 7,
    src: '/assets/images/gallery/spirit.webp',
    alt: 'A woman meditating',
    size: 'large'
  },
  {
    id: 8,
    src: '/assets/images/gallery/gallery_1_small.webp',
    alt: 'A man hearing headphones',
    size: 'small'
  },
  {
    id: 9,
    src: '/assets/images/gallery/gallery_2_small.webp',
    alt: 'A woman working on her laptop',
    size: 'small'
  },
  {
    id: 10,
    src: '/assets/images/gallery/gallery_3_small.webp',
    alt: 'A woman watching videos',
    size: 'small'
  },
  {
    id: 11,
    src: '/assets/images/gallery/gallery_5_small.webp',
    alt: 'A woman holding books',
    size: 'small'
  },
  {
    id: 12,
    src: '/assets/images/gallery/gallery_6_small.webp',
    alt: 'Men talking to a woman',
    size: 'small'
  }
  // Add all your images here with their correct paths and sizes
] as const;

const Gallery = () => {
  // State management
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Initialize hooks
  const { data, isLoading: isDataLoading } = useGallery();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load gallery content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  // Process images data
  const images = data?.data?.images.map((image) => ({
    id: image.id,
    src: `${API_CONFIG.imageBaseURL}${image.url}`,
    alt: image.alternativeText,
    size: image.height > 400 ? 'large' : 'small'
  }));

  // Image ordering logic
  const orderImages = useCallback((images: typeof GALLERY_IMAGES | undefined) => {
    if (!images) return [];
    
    const orderedImages = [];
    const smallImages = images.filter((image) => image.size === 'small');
    const largeImages = images.filter((image) => image.size === 'large');

    while (smallImages?.length > 0 && largeImages?.length > 0) {
      orderedImages.push(largeImages.shift());
      orderedImages.push(smallImages.shift());
    }

    return orderedImages;
  }, []);

  const orderedImages = orderImages(images);
  const galleryImages = orderedImages?.length > 0 ? orderedImages : GALLERY_IMAGES;
  const visibleImages = galleryImages.slice(0, visibleCount);

  // Collect visible image URLs for preloading
  const getVisibleImageUrls = useCallback(() => {
    return visibleImages.map(image => image.src);
  }, [visibleImages]);

  // Handle image preloading
  const loadImages = useCallback(async () => {
    const imageUrls = getVisibleImageUrls();
    if (imageUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(imageUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getVisibleImageUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  // Intersection Observer setup
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    imageRefs.current.forEach((imageRef) => {
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
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Image preloading effect
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Navigation handlers
  const hasMore = visibleCount < galleryImages.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, galleryImages.length));
  };

  const nextImage = () => {
    setCurrentMobileIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentMobileIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
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
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={styles.galleryContainer}
      aria-labelledby="gallery-title"
    >
      <div className={styles.galleryContent}>
        <div className={styles.header}>
          <h2 
            className={styles.title}
            id="gallery-title"
          >
            <span className={styles.gradientText}>{data?.data?.Title || 'Curated Content'}</span> {data?.data?.highlightedTitle}
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
              <img
                ref={el => imageRefs.current[currentMobileIndex] = el}
                src={galleryImages[currentMobileIndex]?.src}
                data-src={galleryImages[currentMobileIndex]?.src}
                alt={galleryImages[currentMobileIndex]?.alt}
                className={styles.mobileImage}
                loading="lazy"
                decoding="async"
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
            <div 
              className={styles.masonryGrid}
              role="region"
              aria-label="Gallery grid"
            >
              {visibleImages.map((image, index) => (
                <div 
                  key={image?.id} 
                  className={`${styles.masonryItem} ${styles[image?.size || 'large']}`}
                  role="img"
                  aria-label={image?.alt}
                >
                  <img
                    ref={el => imageRefs.current[index] = el}
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    data-src={image?.src}
                    alt={image?.alt}
                    className={styles.image}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = image?.src || '';
                    }}
                  />
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