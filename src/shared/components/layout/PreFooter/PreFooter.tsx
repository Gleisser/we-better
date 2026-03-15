import { useRef } from 'react';
import styles from './PreFooter.module.css';
import { usePrefooter } from '@/shared/hooks/usePrefooter';
import { PREFOOTER_FALLBACK } from '@/utils/constants/fallback';
import { renderHighlightedText } from '@/utils/helpers/textFormatting';
import { API_CONFIG } from '@/core/config/api-config';
import { ButtonArrowIcon } from '@/shared/components/common/icons';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useDeferredSectionQuery } from '@/shared/hooks/utils/useDeferredSectionQuery';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';
import { createResponsiveMediaFromImage } from '@/utils/helpers/responsiveMedia';

const PreFooter = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldFetch = useDeferredSectionQuery(sectionRef);

  // Initialize hooks
  const { data, isLoading: isDataLoading } = usePrefooter({ enabled: shouldFetch });
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load pre-footer content',
  });

  // Determine content source
  const prefooter = data?.data || PREFOOTER_FALLBACK;
  const isAPI = data !== undefined;

  // Prepare image URL
  const imageUrl = isAPI ? API_CONFIG.imageBaseURL + prefooter?.image.url : prefooter?.image.url;
  const imageMedia =
    isAPI && imageUrl
      ? (createResponsiveMediaFromImage(
          {
            ...prefooter.image,
            src: imageUrl,
            alt: LANDING_MEDIA.preFooter.alt,
          },
          {
            alt: LANDING_MEDIA.preFooter.alt,
            sizes: '(max-width: 768px) 100vw, 50vw',
          }
        ) ?? LANDING_MEDIA.preFooter)
      : LANDING_MEDIA.preFooter;

  // Prepare title with fallback
  const defaultTitle = (
    <>
      Create your <span className={styles.highlight}>future</span>, with the power of We Better
    </>
  );

  const title = renderHighlightedText({
    text: prefooter?.title,
    highlightClassName: styles.highlight,
    fallback: defaultTitle,
  });

  // Show loading state only during initial data fetch
  if (isDataLoading) {
    return (
      <section className={styles.preFooterContainer}>
        <div className={styles.preFooterContent}>
          <div className={styles.loadingState} aria-busy="true">
            Loading content...
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.preFooterContainer}>
        <div className={styles.preFooterContent}>
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
    <section
      ref={sectionRef}
      className={styles.preFooterContainer}
      aria-labelledby="prefooter-title"
    >
      <div className={styles.preFooterContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <h2 className={styles.title} id="prefooter-title">
            {title}
          </h2>

          <div className={styles.actionContainer} role="group" aria-label="Call to action">
            <a
              href="https://webetter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.button} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
              aria-label="Get started with We Better"
            >
              {prefooter?.buttonText}
              <ButtonArrowIcon className={styles.arrow} aria-hidden="true" />
            </a>
            <p className={styles.note}>{prefooter?.buttonDescription}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn} role="presentation">
          <ResponsiveImage media={imageMedia} className={styles.image} loading="lazy" />
        </div>
      </div>
    </section>
  );
};

export default PreFooter;
