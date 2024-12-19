import { useState, useEffect } from 'react';
import styles from './Gallery.module.css';
import { useGallery } from '@/hooks/useGallery';
import { API_CONFIG } from '@/lib/api-config';
const INITIAL_LOAD = 12;
const LOAD_MORE_COUNT = 8;

const GALLERY_IMAGES = [
  {
    id: 1,
    src: '/assets/images/gallery/gallery_1_large.webp',
    alt: 'Character in yellow raincoat',
    size: 'large'
  },
  {
    id: 2,
    src: '/assets/images/gallery/gallery_2_small.webp',
    alt: 'Cyberpunk character portrait',
    size: 'small'
  },
  {
    id: 3,
    src: '/assets/images/gallery/gallery_3_large.webp',
    alt: 'Crystal flower in glass',
    size: 'large'
  },
  {
    id: 4,
    src: '/assets/images/gallery/gallery_4_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 5,
    src: '/assets/images/gallery/gallery_5_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 6,
    src: '/assets/images/gallery/gallery_6_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 7,
    src: '/assets/images/gallery/gallery_7_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 8,
    src: '/assets/images/gallery/gallery_8_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 9,
    src: '/assets/images/gallery/gallery_9_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 10,
    src: '/assets/images/gallery/gallery_10_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 11,
    src: '/assets/images/gallery/gallery_11_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 12,
    src: '/assets/images/gallery/gallery_12_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 13,
    src: '/assets/images/gallery/gallery_13_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 14,
    src: '/assets/images/gallery/gallery_14_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 15,
    src: '/assets/images/gallery/gallery_15_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 16,
    src: '/assets/images/gallery/gallery_16_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 17,
    src: '/assets/images/gallery/gallery_17_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 18,
    src: '/assets/images/gallery/gallery_18_large.webp',
    alt: 'Motorcycle in neon lights',
    size: 'large'
  },
  {
    id: 19,
    src: '/assets/images/gallery/gallery_19_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 20,
    src: '/assets/images/gallery/gallery_20_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 21,
    src: '/assets/images/gallery/gallery_21_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 22,
    src: '/assets/images/gallery/gallery_22_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 23,
    src: '/assets/images/gallery/gallery_23_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 24,
    src: '/assets/images/gallery/gallery_24_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 25,
    src: '/assets/images/gallery/gallery_25_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  {
    id: 26,
    src: '/assets/images/gallery/gallery_26_small.webp',
    alt: 'Motorcycle in neon lights',
    size: 'small'
  },
  // Add all your images here with their correct paths and sizes
] as const;

const Gallery = () => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { data: gallery } = useGallery();

  const images = gallery?.data?.images.map((image) => {
    return {
      id: image.id,
      src: `${API_CONFIG.imageBaseURL}${image.url}`,
      alt: image.alternativeText,
      size: image.height > 400 ? 'large' : 'small'
    }
  });

  const orderImages = (images: { id: number; src: string; alt: string; size: string; }[] | undefined) => {
    const orderedImages = [];

    const smallImages = images?.filter((image) => image.size === 'small');
    const largeImages = images?.filter((image) => image.size === 'large');

    if (largeImages && smallImages) {
      while (smallImages?.length > 0 && largeImages?.length > 0) {
        orderedImages.push(largeImages.shift());
        orderedImages.push(smallImages.shift());
      }
    }

    return orderedImages;
  }

  const orderedImages = orderImages(images);

  const galleryImages = orderedImages.length > 0 ? orderedImages : GALLERY_IMAGES;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const visibleImages = galleryImages.slice(0, visibleCount);
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

  

  return (
    <section className={styles.galleryContainer}>
      <div className={styles.galleryContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.gradientText}>Platform</span> Gallery
            <svg 
              className={styles.paintIcon} 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2"
                stroke="url(#paint-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path 
                d="M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12"
                stroke="url(#paint-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint-gradient"
                  x1="2"
                  y1="2"
                  x2="22"
                  y2="22"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#D946EF" />
                </linearGradient>
              </defs>
            </svg>
          </h2>
        </div>

        {isMobile ? (
          <div className={styles.mobileGallery}>
            <button 
              onClick={prevImage} 
              className={`${styles.mobileNavButton} ${styles.prevButton}`}
            >
              <svg viewBox="0 0 24 24" className={styles.navIcon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className={styles.mobileImageContainer}>
              <img
                src={galleryImages[currentMobileIndex]?.src}
                alt={galleryImages[currentMobileIndex]?.alt}
                className={styles.mobileImage}
              />
            </div>

            <button 
              onClick={nextImage} 
              className={`${styles.mobileNavButton} ${styles.nextButton}`}
            >
              <svg viewBox="0 0 24 24" className={styles.navIcon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div className={styles.masonryGrid}>
              {visibleImages.map((image) => (
                <div 
                  key={image?.id} 
                  className={`${styles.masonryItem} ${styles[image?.size || 'large']}`}
                >
                  <img
                    src={image?.src}
                    alt={image?.alt}
                    className={styles.image}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button 
                  onClick={handleLoadMore}
                  className={styles.loadMoreButton}
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