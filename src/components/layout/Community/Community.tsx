import { useEffect, useRef } from 'react';
import styles from './Community.module.css';

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
            #3 Discord Server in the World
          </div>
          
          <h2 className={styles.title}>
            Be part of a{' '}
            <span className={styles.highlight}>creative</span>{' '}
            community!{' '}
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
            <svg 
              className={styles.discordIcon} 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
            >
              <path 
                fill="currentColor" 
                d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
              />
            </svg>
            Join Discord Server
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