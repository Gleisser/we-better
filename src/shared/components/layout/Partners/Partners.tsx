import { usePartner } from '@/shared/hooks/usePartner';
import styles from './Partners.module.css';
import { API_CONFIG } from '@/lib/api-config';
import { renderHighlightedText } from '@/utils/helpers/textFormatting';
import { PARTNERS_FALLBACK } from '@/utils/constants/fallback';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { useCallback, useEffect } from 'react';

const defaultTitle = (
  <>
    Our <span className={styles.highlight}>Partners</span>
  </>
);

const Partners = () => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = usePartner();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load partners content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  // Determine content source
  const partners = data?.data || PARTNERS_FALLBACK;
  const isAPI = data !== undefined;

  // Collect all brand logo URLs
  const getLogoUrls = useCallback(() => {
    if (!partners?.brands) return [];
    
    return partners.brands.map(brand => 
      isAPI ? API_CONFIG.imageBaseURL + brand.logo.img.url : brand.logo.img.url
    );
  }, [partners, isAPI]);

  // Handle image preloading
  const loadImages = useCallback(async () => {
    const logoUrls = getLogoUrls();
    if (logoUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(logoUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getLogoUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Show loading state only during initial data fetch
  if (isDataLoading) {
    return (
      <section className={styles.partnersContainer}>
        <div className={styles.partnersContent}>
          <div className={styles.loadingState} aria-busy="true">
            Loading partners...
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.partnersContainer}>
        <div className={styles.partnersContent}>
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
      className={styles.partnersContainer}
      aria-labelledby="partners-title"
    >
      <div className={styles.partnersContent}>
        <h2 
          className={styles.title}
          id="partners-title"
        >
          {renderHighlightedText({
            text: partners?.title,
            highlightClassName: styles.highlight,
            fallback: defaultTitle
          })}
        </h2>
        
        <div 
          className={styles.logoGrid}
          role="region"
          aria-label="Partner logos"
        >
          {partners.brands.map((brand) => (
            <div 
              key={brand.id} 
              className={styles.logoContainer}
              role="article"
            >
              <img
                src={isAPI ? API_CONFIG.imageBaseURL + brand.logo.img.url : brand.logo.img.url}
                alt={`${brand.name} logo`}
                className={`${styles.logo} ${brand.name === 'Dedium' ? styles.largeLogo : ''}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 