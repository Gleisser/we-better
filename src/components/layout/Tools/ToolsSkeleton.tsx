import styles from './Tools.module.css';

const ToolsSkeleton = () => {
  return (
    <section className={styles.toolsContainer}>
      <div className={styles.toolsContent}>
        {/* Title Section Skeleton */}
        <div className={styles.titleContainer}>
          <div className={styles.mainTitle}>
            <div className="h-12 bg-white/5 rounded-lg animate-pulse w-64" />
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Tabs Navigation Skeleton */}
          <div className={styles.tabsContainer}>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-8 bg-white/5 rounded-lg animate-pulse w-32"
              />
            ))}
          </div>

          {/* Content Section Skeleton */}
          <div className={styles.contentContainer}>
            <div className={styles.textContent}>
              <div className="h-8 bg-white/5 rounded-lg animate-pulse w-3/4 mb-4" />
              <div className="h-6 bg-white/5 rounded-lg animate-pulse w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-4/6" />
              </div>
            </div>

            <div className={styles.videoContainer}>
              <div className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSkeleton; 