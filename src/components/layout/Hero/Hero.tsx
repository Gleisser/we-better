import { HERO_CONSTANTS } from "@/constants/hero";
import styles from "./Hero.module.css";
import DashboardPreview from "./DashboardPreview";
import FloatingImage from './FloatingImage';
import HeroBackground from './HeroBackground';
import CtaButton from "./Buttons/CtaButton";
import SecondaryCtaButton from "./Buttons/SecondaryCtaButton";
import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { useHero } from '@/hooks/useHero';

export const Hero = () => {
  const { data, error, isFetching } = useHero();
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

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

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  //When the API is not available, we show a fallback component
  const fallbackData = {
    title: HERO_CONSTANTS.DEFAULT_TITLE,
    subtitle: HERO_CONSTANTS.DEFAULT_SUBTITLE,
    cta_text: HERO_CONSTANTS.DEFAULT_CTA_TEXT,
    secondary_cta_text: HERO_CONSTANTS.DEFAULT_SECONDARY_CTA_TEXT,
    images: HERO_CONSTANTS.FLOATING_IMAGES,
    main_image_mobile: {
      src: "/assets/images/hero/mobile/app_hero_img-mobile.webp",
      alt: "We Better Mobile App",
    },
    main_image: {
      src: "/assets/images/hero/app_hero_img.webp",
      alt: "We Better Dashboard"
    }
  };

  const heroData = (error || showFallback) ? fallbackData : data?.data;
  
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
            <img 
              src={heroData?.main_image_mobile?.src} 
              alt="Leonardo.AI Mobile App"
              className={styles.mobilePreviewImage}
            />
          ) : (
            <DashboardPreview src={heroData?.main_image?.src} alt={heroData?.main_image?.alt} />
          )}
        </div>
        {heroData?.images.map((image, index) => (
          <FloatingImage
            key={index}
            src={image.src}
            alt={image.alt}
            className={`${styles.floatingImage} ${HERO_CONSTANTS.FLOATING_IMAGES[index].className} z-40`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;