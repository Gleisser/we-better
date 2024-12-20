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

export const Hero = () => {
  const { data, error, isFetching } = useHero();
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
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
    // Show fallback component if loading from the API takes more than 2 seconds
    const timer = setTimeout(() => {
      if (isFetching) setShowFallback(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isFetching]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const heroData = (error || showFallback) ? HERO_FALLBACK : data?.data;
  
  return (
    <div className={styles.heroContainer}>
      <HeroBackground />
      <motion.div 
        className={styles.contentWrapper}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>
          <span>{heroData?.title}</span>
        </h1>
        <h2 className={styles.subtitle}>{heroData?.subtitle}</h2>
        <div className={styles.ctaContainer}>
          <CtaButton text={heroData?.cta_text} />
          <SecondaryCtaButton text={heroData?.secondary_cta_text} />
        </div>
      </motion.div>

      <div className={styles.previewContainer}>
        <div className={styles.mainPreview}>
          {isMobile ? (
            <motion.img 
              ref={el => {
                mainImageRef.current = el;
                if (el) observerRef.current?.observe(el);
              }}
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              data-src={heroData?.main_image_mobile?.src}
              alt="Leonardo.AI Mobile App"
              className={styles.mobilePreviewImage}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          ) : (
            <DashboardPreview 
              src={heroData?.main_image?.src} 
              alt={heroData?.main_image?.alt}
              ref={mainImageRef}
              observerRef={observerRef}
            />
          )}
        </div>
        {heroData?.images.map((image, index) => (
          <FloatingImage
            key={index}
            src={image.src}
            alt={image.alt}
            className={`${styles.floatingImage} ${HERO_FALLBACK.images[index].className} z-40`}
            ref={el => {
              imageRefs.current[index] = el;
              if (el) observerRef.current?.observe(el);
            }}
            observerRef={observerRef}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;