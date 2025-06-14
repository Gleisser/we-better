import styles from './Highlights.module.css';

const HighlightsSkeleton = (): JSX.Element => {
  return (
    <section className={styles.highlightsContainer}>
      <div className={styles.highlightsTitle}>
        {/* Title skeletons */}
        <div className="h-10 bg-white/5 rounded-lg animate-pulse w-64" />
        <div className="h-10 bg-white/5 rounded-lg animate-pulse w-96" />
      </div>

      <div className={styles.sliderContainer}>
        {/* Main image skeleton */}
        <div className="absolute inset-0 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </section>
  );
};

export default HighlightsSkeleton;
