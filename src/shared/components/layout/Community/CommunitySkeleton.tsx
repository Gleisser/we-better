import styles from './Community.module.css';

const CommunitySkeleton = (): JSX.Element => {
  return (
    <section className={styles.communityContainer}>
      <div className={styles.communityContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Discord label skeleton */}
          <div className="h-8 bg-white/5 rounded-full animate-pulse w-48" />

          {/* Title skeleton */}
          <div className="space-y-4 mt-6">
            <div className="h-12 bg-white/5 rounded-lg animate-pulse w-3/4" />
            <div className="h-12 bg-white/5 rounded-lg animate-pulse w-1/2" />
          </div>

          {/* Button skeleton */}
          <div className="h-12 bg-white/5 rounded-lg animate-pulse w-48 mt-6" />
        </div>

        {/* Right Column - Profile Images */}
        <div className={styles.rightColumn}>
          <div className={styles.profileColumns}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.profileColumn}>
                <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySkeleton;
