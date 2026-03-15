import { useEffect, useRef } from 'react';
import styles from './Community.module.css';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { renderHighlightedText } from '@/utils/helpers/textFormatting';
import { DiscordIcon } from '@/shared/components/common/icons';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useDeferredSectionQuery } from '@/shared/hooks/utils/useDeferredSectionQuery';
import ResponsiveImage from '@/shared/components/common/ResponsiveImage/ResponsiveImage';
import { LANDING_MEDIA } from '@/utils/constants/media/landingMedia';

const INITIAL_PROFILES = [
  {
    id: 1,
    media: LANDING_MEDIA.community.profile1,
  },
  {
    id: 2,
    media: LANDING_MEDIA.community.profile2,
  },
  {
    id: 3,
    media: LANDING_MEDIA.community.profile3,
  },
  {
    id: 4,
    media: LANDING_MEDIA.community.profile4,
  },
  {
    id: 5,
    media: LANDING_MEDIA.community.profile5,
  },
  {
    id: 6,
    media: LANDING_MEDIA.community.profile6,
  },
] as const;

const Community = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const profilesRef = useRef<HTMLDivElement>(null);
  const shouldFetch = useDeferredSectionQuery(sectionRef);

  // Initialize hooks
  const { data, isLoading: isDataLoading } = useCommunity({ enabled: shouldFetch });
  const { isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load community content',
  });

  const defaultTitle = (
    <>
      <span className={styles.highlight}>Community of achievers</span> worldwide!{' '}
      <span role="img" aria-label="Earth">
        🌎
      </span>
    </>
  );

  // Handle scroll animation
  useEffect(() => {
    const handleScroll = (): void => {
      if (!profilesRef.current) return;

      const scrollPosition = window.scrollY;
      const element = profilesRef.current;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const windowHeight = window.innerHeight;

      if (
        scrollPosition + windowHeight > elementTop &&
        scrollPosition < elementTop + element.offsetHeight
      ) {
        const relativeScroll = scrollPosition - elementTop + windowHeight;

        const columns = element.children;
        Array.from(columns).forEach((column, index) => {
          const isOddColumn = index % 2 === 0;
          const direction = isOddColumn ? 1 : -1;
          const speed = isOddColumn ? 0.15 : 0.1;
          const offset = relativeScroll * speed * direction;

          const initialOffset = isOddColumn ? -200 : 0;
          const maxOffset = isOddColumn ? 400 : 200;
          const limitedOffset = Math.max(Math.min(offset, maxOffset), -maxOffset);

          (column as HTMLElement).style.transform =
            `translateY(${limitedOffset + initialOffset}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading state only during initial data fetch
  if (isDataLoading) {
    return (
      <section className={styles.communityContainer}>
        <div className={styles.communityContent}>
          <div className={styles.loadingState} aria-busy="true">
            Loading community content...
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (isError) {
    return (
      <section className={styles.communityContainer}>
        <div className={styles.communityContent}>
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
      className={styles.communityContainer}
      aria-labelledby="community-title"
    >
      <div className={styles.communityContent}>
        <div className={styles.leftColumn}>
          <div className={styles.discordLabel} aria-label="Discord server ranking">
            {data?.data?.label || '#1 Self Improvement Community'}
          </div>

          <h2 className={styles.title} id="community-title">
            {renderHighlightedText({
              text: data?.data?.title,
              highlightClassName: styles.highlight,
              fallback: defaultTitle,
            })}
            {data?.data?.title && (
              <span role="img" aria-label="Earth">
                🌎
              </span>
            )}
          </h2>

          <a
            href="https://discord.gg/webetter"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discordButton}
            aria-label="Join our community"
          >
            <DiscordIcon className={styles.discordIcon} aria-hidden="true" />
            {data?.data?.buttonText || 'Join Now'}
          </a>
        </div>

        <div className={styles.rightColumn} role="presentation">
          <div className={styles.profileColumns} ref={profilesRef} aria-hidden="true">
            {INITIAL_PROFILES.map(profile => (
              <div key={profile.id} className={styles.profileColumn}>
                <ResponsiveImage
                  media={profile.media}
                  className={styles.profileImage}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
