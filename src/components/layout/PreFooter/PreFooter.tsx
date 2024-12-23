import styles from './PreFooter.module.css';
import { usePrefooter } from '@/hooks/usePrefooter';
import { PREFOOTER_FALLBACK } from '@/constants/fallback';
import { renderHighlightedText } from '@/utils/textFormatting';
import { API_CONFIG } from '@/lib/api-config';
import { ButtonArrowIcon } from '@/components/common/icons';
import { useImagePreloader } from '@/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/hooks/utils/useLoadingState';
import { useEffect, useCallback } from 'react';

const PreFooter = () => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = usePrefooter();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load pre-footer content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  // Determine content source
  const prefooter = data?.data || PREFOOTER_FALLBACK;
  const isAPI = data !== undefined;
  
  // Prepare image URL
  const imageUrl = isAPI 
    ? API_CONFIG.imageBaseURL + prefooter?.image.url 
    : prefooter?.image.url;

  // Memoize the image loading function
  const loadImage = useCallback(async () => {
    if (!imageUrl || isLoading) return;
    
    try {
      startLoading();
      await preloadImages([imageUrl]);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [imageUrl, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  // Handle image preloading
  useEffect(() => {
    if (imageUrl) {
      loadImage();
    }
  }, [imageUrl, loadImage]);

  // Prepare title with fallback
  const defaultTitle = (
    <>Create your next <span className={styles.highlight}>artwork</span>, with the power of Leonardo Ai</>
  );
  
  const title = renderHighlightedText({
    text: prefooter?.title,
    highlightClassName: styles.highlight,
    fallback: defaultTitle
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
      className={styles.preFooterContainer}
      aria-labelledby="prefooter-title"
    >
      <div className={styles.preFooterContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <h2 
            className={styles.title}
            id="prefooter-title"
          >
            {title}
          </h2>
          
          <div 
            className={styles.actionContainer}
            role="group"
            aria-label="Call to action"
          >
            <a 
              href="https://leonardo.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.button} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-md`}
              aria-label="Get started with Leonardo AI"
            >
              {prefooter?.buttonText}
              <ButtonArrowIcon className={styles.arrow} aria-hidden="true" />
            </a>
            <p className={styles.note}>{prefooter?.buttonDescription}</p>
          </div>
        </div>

        {/* Right Column */}
        <div 
          className={styles.rightColumn}
          role="presentation"
        >
          <div className={styles.imageContainer}>
            <img
              src={imageUrl}
              alt="Interactive preview of Leonardo AI platform showcasing creative tools and workspace"
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter; 