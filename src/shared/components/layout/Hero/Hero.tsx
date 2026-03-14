import { HERO_FALLBACK } from '@/utils/constants/fallback';
import { cn } from '@/utils/classnames';
import DashboardPreview from './DashboardPreview';
import FloatingImage from './FloatingImage';
import HeroBackground from './HeroBackground';
import CtaButton from './Buttons/CtaButton';
import SecondaryCtaButton from './Buttons/SecondaryCtaButton';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useHero } from '@/shared/hooks/useHero';
import HeroSkeleton from './HeroSkeleton';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';
import { createResponsiveMediaFromImage } from '@/utils/helpers/responsiveMedia';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';
import { useImagePreloadLink } from '@/shared/hooks/utils/useImagePreloadLink';

export const Hero = (): JSX.Element => {
  const { data, error, isFetching: isDataLoading } = useHero();
  const isError = Boolean(error);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 768
  );
  const [showFallback, setShowFallback] = useState(false);

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
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const isUsingFallback = isError || showFallback || !data?.data;
  const heroData = isUsingFallback ? HERO_FALLBACK : data.data;

  const heroMainMedia = useMemo(
    () =>
      isUsingFallback
        ? LANDING_MEDIA.heroDesktop
        : (createResponsiveMediaFromImage(heroData?.main_image, {
            alt: heroData?.main_image?.alt || 'We Better Dashboard Interface',
            sizes: '(max-width: 1280px) 100vw, 1024px',
          }) ?? LANDING_MEDIA.heroDesktop),
    [heroData, isUsingFallback]
  );

  const heroMobileMedia = useMemo(
    () =>
      isUsingFallback
        ? LANDING_MEDIA.heroMobile
        : (createResponsiveMediaFromImage(heroData?.main_image_mobile, {
            alt: heroData?.main_image_mobile?.alt || 'We Better Mobile App Interface',
            sizes: '(max-width: 768px) 100vw, 480px',
          }) ?? LANDING_MEDIA.heroMobile),
    [heroData, isUsingFallback]
  );

  const floatingMedia = useMemo(() => {
    if (isUsingFallback) {
      return [
        LANDING_MEDIA.heroFloating.menHiking,
        LANDING_MEDIA.heroFloating.womanPlanning,
        LANDING_MEDIA.heroFloating.coupleRelationship,
        LANDING_MEDIA.heroFloating.manMeditating,
      ];
    }

    return heroData?.images.map((image, index) => {
      const fallbackMedia = [
        LANDING_MEDIA.heroFloating.menHiking,
        LANDING_MEDIA.heroFloating.womanPlanning,
        LANDING_MEDIA.heroFloating.coupleRelationship,
        LANDING_MEDIA.heroFloating.manMeditating,
      ][index];

      return (
        createResponsiveMediaFromImage(image, {
          alt: '',
          sizes: '(max-width: 1280px) 200px, 320px',
        }) ?? fallbackMedia
      );
    });
  }, [heroData?.images, isUsingFallback]);

  const highPriorityImageProps = useMemo(
    () =>
      ({
        fetchPriority: 'high',
      }) as const,
    []
  );

  useImagePreloadLink(isMobile ? heroMobileMedia : heroMainMedia, {
    enabled: Boolean(isMobile ? heroMobileMedia : heroMainMedia),
    id: 'landing-hero-main-image',
  });

  if (isDataLoading && !showFallback) {
    return <HeroSkeleton />;
  }

  if (isError && !showFallback) {
    return (
      <section className="relative isolate z-[1] flex min-h-screen w-full flex-col items-center justify-center overflow-visible overflow-x-hidden bg-black pb-16 md:px-4 md:pb-[20rem]">
        <div
          className="flex min-h-[400px] flex-col items-center justify-center text-white/70"
          role="alert"
        >
          <p>{error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-primary-purple px-6 py-2 text-white transition-all duration-200 hover:bg-primary-purple/80"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative isolate z-[1] flex min-h-screen w-full max-w-full flex-col items-center justify-center overflow-visible overflow-x-hidden bg-black pb-16 md:px-4 md:pb-[20rem]"
      aria-labelledby="hero-title"
    >
      <HeroBackground aria-hidden="true" />
      <motion.div
        className="relative z-[2] mt-20 flex w-full flex-col items-center justify-center gap-4 px-4 text-center md:mx-auto md:max-w-7xl md:px-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1
          className="flex flex-col gap-1 font-plus-jakarta text-[2.5rem] font-bold text-white md:mb-6 md:text-6xl"
          id="hero-title"
        >
          <span>{heroData?.title}</span>
        </h1>
        <p className="mb-10 max-w-2xl px-6 font-plus-jakarta text-lg text-white/80 md:mb-8 md:px-0 md:text-2xl">
          {heroData?.subtitle}
        </p>
        <div
          className="mb-16 flex flex-col justify-center gap-5 md:mb-24 md:flex-row md:gap-4"
          role="group"
          aria-label="Call to action"
        >
          <CtaButton text={heroData?.cta_text} aria-label={heroData?.cta_text} />
          <SecondaryCtaButton
            text={heroData?.secondary_cta_text}
            aria-label={heroData?.secondary_cta_text}
          />
        </div>
      </motion.div>

      <div className="relative z-[3] mt-8 w-full max-w-6xl" role="presentation">
        <div className="relative z-[3] mb-4 w-full px-4 md:mb-0 md:px-0">
          {isMobile ? (
            <ResponsiveImage
              media={heroMobileMedia}
              alt="We Better Mobile App Interface"
              className="h-auto w-full max-h-[60vh] rounded-xl object-contain"
              loading="eager"
              {...highPriorityImageProps}
            />
          ) : (
            <DashboardPreview media={heroMainMedia} />
          )}
        </div>

        <div aria-hidden="true">
          {floatingMedia?.map((media, index: number) => (
            <FloatingImage
              key={`floating-image-${index}`}
              media={media}
              className={cn(
                'hidden h-auto w-auto max-w-[300px] md:block md:max-w-[400px]',
                HERO_FALLBACK.images[index].className,
                'z-40'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
