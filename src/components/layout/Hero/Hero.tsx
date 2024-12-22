import { HERO_FALLBACK } from "@/constants/fallback";
import styles from "./Hero.module.css";
import DashboardPreview from "./DashboardPreview";
import FloatingImage from './FloatingImage';
import HeroBackground from './HeroBackground';
import CtaButton from "./Buttons/CtaButton";
import SecondaryCtaButton from "./Buttons/SecondaryCtaButton";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from 'react';
import { useHero } from '@/hooks/useHero';
import HeroSkeleton from './HeroSkeleton';

const preloadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
};

export const Hero = () => {
  const { data, error, isFetching } = useHero();
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
      if (isFetching || error) {
        setShowFallback(true);
      }
    }, 1000);

    if (data) {
      setShowFallback(false);
    }

    return () => clearTimeout(timer);
  }, [isFetching, error, data]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const heroData = error || showFallback || !data?.data 
    ? HERO_FALLBACK 
    : data.data;

  useEffect(() => {
    const preloadFallbackImages = async () => {
      const fallbackImagesToPreload = [
        HERO_FALLBACK.main_image.src,
        HERO_FALLBACK.main_image_mobile.src,
        ...HERO_FALLBACK.images.slice(0, 2).map(img => img.src)
      ];

      try {
        await Promise.all(fallbackImagesToPreload.map(src => preloadImage(src)));
      } catch (error) {
        console.warn('Failed to preload fallback images:', error);
      }
    };

    preloadFallbackImages();
  }, []);

  useEffect(() => {
    if (data?.data) {
      const preloadCriticalImages = async () => {
        const imagesToPreload = [
          data.data.main_image?.src,
          data.data.main_image_mobile?.src,
          ...data.data.images.slice(0, 2).map(img => img.src)
        ].filter(Boolean) as string[];

        try {
          await Promise.all(imagesToPreload.map(src => preloadImage(src)));
        } catch (error) {
          console.warn('Failed to preload some hero images:', error);
        }
      };

      preloadCriticalImages();
    }
  }, [data]);

  // Show skeleton while loading
  if (isFetching && !showFallback) {
    return <HeroSkeleton />;
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