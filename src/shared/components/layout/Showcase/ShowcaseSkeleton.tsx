import styles from './Showcase.module.css';

const ShowcaseSkeleton = (): JSX.Element => {
  return (
    <section className={styles.showcaseContainer} data-testid="showcase-skeleton">
      <div className={styles.showcaseContent}>
        <div className={styles.header}>
          {/* Title skeleton */}
          <div className="space-y-4">
            <div
              className="h-10 bg-white/5 rounded-lg animate-pulse w-96"
              data-testid="title-skeleton"
            />
            <div
              className="h-10 bg-white/5 rounded-lg animate-pulse w-64"
              data-testid="title-skeleton"
            />
          </div>

          {/* Navigation skeleton */}
          <div className={styles.navigation}>
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Belt items skeleton */}
        <div className={styles.belt}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.item} data-testid="belt-item-skeleton">
              <div className={styles.imageContainer}>
                <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="h-6 bg-white/5 rounded animate-pulse w-3/4 mt-4" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSkeleton;
