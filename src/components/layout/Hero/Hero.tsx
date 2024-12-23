import { HERO_FALLBACK } from "@/constants/fallback";
import styles from "./Hero.module.css";
import DashboardPreview from "./DashboardPreview";
import FloatingImage from './FloatingImage';
import HeroBackground from './HeroBackground';
import CtaButton from "./Buttons/CtaButton";
import SecondaryCtaButton from "./Buttons/SecondaryCtaButton";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useHero } from '@/hooks/useHero';
import HeroSkeleton from './HeroSkeleton';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';

const preloadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
};

export const Hero = () => {
  const { data, isFetching: isDataLoading } = useHero();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load hero content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const mainImageRef = useRef<HTMLImageElement | null>(null);

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

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDataLoading || isError) {
        setShowFallback(true);
      }
    }, 1000);

    if (data) {
      setShowFallback(false);
    }

    return () => clearTimeout(timer);
  }, [isDataLoading, isError, data]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const heroData = isError || showFallback || !data?.data 
    ? HERO_FALLBACK 
    : data.data;

  const getMainImageUrl = useCallback(() => {
    if (data?.data) {
      return isMobile ? data.data.main_image_mobile?.src : data.data.main_image?.src;
    }
    return isMobile ? HERO_FALLBACK.main_image_mobile.src : HERO_FALLBACK.main_image.src;
  }, [data?.data, isMobile]);

  const getFloatingImageUrls = useCallback(() => {
    if (data?.data) {
      return data.data.images.map(img => img.src);
    }
    return HERO_FALLBACK.images.map(img => img.src);
  }, [data?.data]);

  useEffect(() => {
    const loadMainImage = async () => {
      const mainImageUrl = getMainImageUrl();
      if (!mainImageUrl) return;

      try {
        startLoading();
        await preloadImages([mainImageUrl]);
      } catch (err) {
        console.warn('Failed to preload main image:', err);
      } finally {
        stopLoading();
      }
    };

    loadMainImage();
  }, [getMainImageUrl, preloadImages, startLoading, stopLoading]);

  useEffect(() => {
    const loadFloatingImages = async () => {
      const imageUrls = getFloatingImageUrls();
      if (imageUrls.length === 0) return;

      try {
        await preloadImages(imageUrls);
      } catch (err) {
        console.warn('Failed to preload floating images:', err);
      }
    };

    const timer = setTimeout(loadFloatingImages, 100);
    return () => clearTimeout(timer);
  }, [getFloatingImageUrls, preloadImages]);

  if (isDataLoading && !showFallback) {
    return <HeroSkeleton />;
  }

  if (isError && !showFallback) {
    return (
      <section className={styles.heroContainer}>
        <div className={styles.errorState} role="alert">
          <p>{error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={styles.heroContainer}
      aria-labelledby="hero-title"
    >
      <HeroBackground aria-hidden="true" />
      <motion.div 
        className={styles.contentWrapper}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 
          className={styles.title}
          id="hero-title"
        >
          <span>{heroData?.title}</span>
        </h1>
        <p className={styles.subtitle}>
          {heroData?.subtitle}
        </p>
        <div 
          className={styles.ctaContainer}
          role="group" 
          aria-label="Call to action"
        >
          <CtaButton 
            text={heroData?.cta_text}
            aria-label={heroData?.cta_text} 
          />
          <SecondaryCtaButton 
            text={heroData?.secondary_cta_text}
            aria-label={heroData?.secondary_cta_text}
          />
        </div>
      </motion.div>

      <div 
        className={styles.previewContainer}
        role="presentation"
      >
        <div className={styles.mainPreview}>
          {isMobile ? (
            <motion.img 
              ref={el => {
                mainImageRef.current = el;
                if (el) observerRef.current?.observe(el);
              }}
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              data-src={heroData?.main_image_mobile?.src}
              alt="Leonardo.AI Mobile App Interface"
              className={styles.mobilePreviewImage}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          ) : (
            <DashboardPreview 
              src={heroData?.main_image?.src} 
              alt={heroData?.main_image?.alt || "Leonardo.AI Dashboard Interface"}
              ref={mainImageRef}
              observerRef={observerRef}
            />
          )}
        </div>

        <div aria-hidden="true">
          {heroData?.images.map((image, index) => (
            <FloatingImage
              key={`floating-image-${index}`}
              src={image.src}
              alt=""
              className={`${styles.floatingImage} ${HERO_FALLBACK.images[index].className} z-40`}
              ref={el => {
                imageRefs.current[index] = el;
                if (el && !loadedImages.has(index)) {
                  observerRef.current?.observe(el);
                  setLoadedImages(prev => new Set(prev).add(index));
                }
              }}
              observerRef={observerRef}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;