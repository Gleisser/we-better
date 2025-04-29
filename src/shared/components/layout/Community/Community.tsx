import { useEffect, useRef, useCallback } from 'react';
import styles from './Community.module.css';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { renderHighlightedText } from '@/utils/textFormatting';
import { DiscordIcon } from '@/shared/components/common/icons';
import { useImagePreloader } from '@/shared/hooks/utils/useImagePreloader';
import { useErrorHandler } from '@/shared/hooks/utils/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/utils/useLoadingState';

const INITIAL_PROFILES = [
  {
    id: 1,
    src: '/assets/images/community/community_1.webp',
    alt: 'Community member profile 1'
  },
  {
    id: 2,
    src: '/assets/images/community/community_2.webp',
    alt: 'Community member profile 2'
  },
  {
    id: 3,
    src: '/assets/images/community/community_3.webp',
    alt: 'Community member profile 3'
  },
  {
    id: 4,
    src: '/assets/images/community/community_4.webp',
    alt: 'Community member profile 4'
  },
  {
    id: 5,
    src: '/assets/images/community/community_5.webp',
    alt: 'Community member profile 5'
  },
  {
    id: 6,
    src: '/assets/images/community/community_6.webp',
    alt: 'Community member profile 6'
  }
] as const;

const Community = () => {
  const profilesRef = useRef<HTMLDivElement>(null);
  
  // Initialize hooks
  const { data, isLoading: isDataLoading } = useCommunity();
  const { preloadImages } = useImagePreloader();
  const { handleError, isError, error } = useErrorHandler({
    fallbackMessage: 'Failed to load community content'
  });
  const { isLoading, startLoading, stopLoading } = useLoadingState({
    minimumLoadingTime: 500
  });

  const defaultTitle = (
    <>
      
      <span className={styles.highlight}>Community of achievers</span>{' '}
      worldwide!{' '}
      <span role="img" aria-label="Earth">
        🌎
      </span>
    </>
  );

  // Collect profile image URLs
  const getProfileUrls = useCallback(() => {
    return INITIAL_PROFILES.map(profile => profile.src);
  }, []);

  // Handle image preloading
  const loadImages = useCallback(async () => {
    const profileUrls = getProfileUrls();
    if (profileUrls.length === 0 || isLoading) return;

    try {
      startLoading();
      await preloadImages(profileUrls);
    } catch (err) {
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [getProfileUrls, isLoading, startLoading, preloadImages, handleError, stopLoading]);

  // Handle scroll animation
  useEffect(() => {
    const handleScroll = () => {
      if (!profilesRef.current) return;
      
      const scrollPosition = window.scrollY;
      const element = profilesRef.current;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (scrollPosition + windowHeight > elementTop && scrollPosition < elementTop + element.offsetHeight) {
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

  // Handle image preloading
  useEffect(() => {
    loadImages();
  }, [loadImages]);

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
      className={styles.communityContainer}
      aria-labelledby="community-title"
    >
      <div className={styles.communityContent}>
        <div className={styles.leftColumn}>
          <div 
            className={styles.discordLabel}
            aria-label="Discord server ranking"
          >
            {data?.data?.label || '#1 Self Improvement Community'}
          </div>
          
          <h2 
            className={styles.title}
            id="community-title"
          >
            {renderHighlightedText({
              text: data?.data?.title,
              highlightClassName: styles.highlight,
              fallback: defaultTitle
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

        <div 
          className={styles.rightColumn}
          role="presentation"
        >
          <div 
            className={styles.profileColumns} 
            ref={profilesRef}
            aria-hidden="true"
          >
            {INITIAL_PROFILES.map((profile) => (
              <div key={profile.id} className={styles.profileColumn}>
                <img 
                  src={profile.src}
                  alt={profile.alt}
                  className={styles.profileImage}
                  loading="lazy"
                  decoding="async"
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