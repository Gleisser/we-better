import { useEffect, useRef } from 'react';
import styles from './Community.module.css';
import { useCommunity } from '@/hooks/useCommunity';
import { renderHighlightedText } from '@/utils/textFormatting';
import { DiscordIcon } from '@/components/common/icons';

const INITIAL_PROFILES = [
  {
    id: 1,
    src: '/assets/images/community/list-1.webp',
    alt: 'Community member profile 1'
  },
  {
    id: 2,
    src: '/assets/images/community/list-2.webp',
    alt: 'Community member profile 2'
  },
  {
    id: 3,
    src: '/assets/images/community/list-3.webp',
    alt: 'Community member profile 3'
  },
  {
    id: 4,
    src: '/assets/images/community/list-4.webp',
    alt: 'Community member profile 4'
  },
  {
    id: 5,
    src: '/assets/images/community/list-5.webp',
    alt: 'Community member profile 5'
  },
  {
    id: 6,
    src: '/assets/images/community/list-6.webp',
    alt: 'Community member profile 6'
  }
] as const;

const Community = () => {
  const profilesRef = useRef<HTMLDivElement>(null);
  const { data: community } = useCommunity();

  const defaultTitle = (
    <>
      Be part of a{' '}
      <span className={styles.highlight}>creative</span>{' '}
      community!{' '}
      <span role="img" aria-label="Earth">
        🌎
      </span>
    </>
  );

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

  return (
    <section className={styles.communityContainer}>
      <div className={styles.communityContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <div className={styles.discordLabel}>
            {community?.data?.label || '#3 Discord Server in the World'}
          </div>
          
          <h2 className={styles.title}>
            {renderHighlightedText({
              text: community?.data?.title,
              highlightClassName: styles.highlight,
              fallback: defaultTitle
            })}
            <span role="img" aria-label="Earth">
              🌎
            </span>
          </h2>
          
          <a 
            href="https://discord.gg/leonardo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.discordButton}
          >
            <DiscordIcon className={styles.discordIcon} />
            {community?.data?.buttonText || 'Join Discord Server'}
          </a>
        </div>

        {/* Right Column - Profile Images */}
        <div className={styles.rightColumn}>
          <div className={styles.profileColumns} ref={profilesRef}>
            {INITIAL_PROFILES.map((profile) => (
              <div key={profile.id} className={styles.profileColumn}>
                <img 
                  src={profile.src}
                  alt={profile.alt}
                  className={styles.profileImage}
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