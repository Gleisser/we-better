import styles from './Testimonies.module.css';
import { useTestimony } from '@/shared/hooks/useTestimony';
import { TESTIMONY_FALLBACK } from '@/utils/constants/fallback';
import { API_CONFIG } from '@/core/config/api-config';
import { TestimonyItem } from '@/utils/types/testimony';
import { renderHighlightedText } from '@/utils/helpers/textFormatting';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';
import { useCallback, useEffect } from 'react';

const Testimonies = (): JSX.Element => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useTestimony();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load testimonials',
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500,
  });

  // Determine content source
  const testimony = data?.data || TESTIMONY_FALLBACK;
  const isAPI = data !== undefined;
  const defaultTitle = (
    <>
      A community of over <span className={styles.highlight}>4 million</span> is waiting for you
    </>
  );

  // Collect all profile picture URLs
  const getProfilePicUrls = useCallback(() => {
    if (!testimony?.testimonies) return [];

    return testimony.testimonies.map((item: TestimonyItem) =>
      isAPI ? API_CONFIG.imageBaseURL + item.profilePic.url : item.profilePic.url
    );
  }, [testimony, isAPI]);

  // Handle image preloading
  const loadImages = useCallback(async (): Promise<void> => {
    const profileUrls = getProfilePicUrls();
    if (profileUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(profileUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getProfilePicUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Show loading state only during initial data fetch
  if (isDataLoading) {
    return (
      <section className={styles.testimoniesContainer}>
        <div className={styles.testimoniesContent}>
          <div className={styles.loadingState} aria-busy="true">
            Loading testimonials...
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.testimoniesContainer}>
        <div className={styles.testimoniesContent}>
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
    <section className={styles.testimoniesContainer} aria-labelledby="testimonies-title">
      <div className={styles.testimoniesContent}>
        <div className={styles.header}>
          <h2 className={styles.title} id="testimonies-title">
            {renderHighlightedText({
              text: testimony?.title,
              highlightClassName: styles.highlight,
              fallback: defaultTitle,
            })}
          </h2>
          <p className={styles.description}>{testimony?.subtitle}</p>
        </div>

        <div className={styles.testimonials} role="region" aria-label="User testimonials">
          {testimony.testimonies.map((item: TestimonyItem) => (
            <div key={item.id} className={styles.testimonialCard} role="article">
              <p className={styles.testimonialText}>"{item.testimony}"</p>
              <div className={styles.author}>
                <img
                  src={isAPI ? API_CONFIG.imageBaseURL + item.profilePic.url : item.profilePic.url}
                  alt={item.username}
                  className={styles.avatar}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.authorName}>{item.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonies;
