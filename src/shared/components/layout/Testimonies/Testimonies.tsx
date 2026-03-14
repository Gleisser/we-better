import styles from './Testimonies.module.css';
import { useTestimony } from '@/shared/hooks/useTestimony';
import { TESTIMONY_FALLBACK } from '@/utils/constants/fallback';
import { API_CONFIG } from '@/core/config/api-config';
import { TestimonyItem } from '@/utils/types/testimony';
import { renderHighlightedText } from '@/utils/helpers/textFormatting';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';
import { createResponsiveMediaFromImage } from '@/utils/helpers/responsiveMedia';

const FALLBACK_TESTIMONY_MEDIA = [
  LANDING_MEDIA.testimonies.testimony1,
  LANDING_MEDIA.testimonies.testimony2,
  LANDING_MEDIA.testimonies.testimony3,
];

const Testimonies = (): JSX.Element => {
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useTestimony();
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load testimonials',
  });

  // Determine content source
  const testimony = data?.data || TESTIMONY_FALLBACK;
  const isAPI = data !== undefined;
  const defaultTitle = (
    <>
      A community of over <span className={styles.highlight}>4 million</span> is waiting for you
    </>
  );

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
                <ResponsiveImage
                  media={
                    isAPI
                      ? (createResponsiveMediaFromImage(
                          {
                            ...item.profilePic,
                            src: API_CONFIG.imageBaseURL + item.profilePic.url,
                            alt: item.username,
                          },
                          {
                            alt: item.username,
                            sizes: '(max-width: 768px) 72px, 96px',
                          }
                        ) ??
                        FALLBACK_TESTIMONY_MEDIA[item.id - 1] ??
                        FALLBACK_TESTIMONY_MEDIA[0])
                      : (FALLBACK_TESTIMONY_MEDIA[item.id - 1] ?? FALLBACK_TESTIMONY_MEDIA[0])
                  }
                  className={styles.avatar}
                  loading="lazy"
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
