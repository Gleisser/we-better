import styles from './Features.module.css';

const FeaturesSkeleton = () => {
  return (
    <section className={styles.featuresContainer}>
      <div>
        {/* Features Cards Skeleton */}
        <div className={styles.featuresCard}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="relative group">
              {/* Outer glow effect */}
              <div className={styles.featuresCardOuterGlow} />
              {/* Inner glow effect */}
              <div className={styles.featuresCardInnerGlow} />
              
              {/* Card content */}
              <div className={styles.featuresCardContent}>
                <div className={styles.featuresCardTitleArrowSection}>
                  {/* Title skeleton */}
                  <div className="h-8 bg-white/5 rounded-lg animate-pulse w-2/3" />
                  {/* Arrow skeleton */}
                  <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                </div>
                {/* Description skeleton */}
                <div className="space-y-3 mt-6">
                  <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                  <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-white/5 rounded animate-pulse w-4/6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Brands Skeleton */}
        <div className="mt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Featured title skeleton */}
            <div className="h-6 bg-white/5 rounded animate-pulse w-48 mx-auto mb-8" />
            
            {/* Brands grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex justify-center items-center">
                  <div className="h-8 bg-white/5 rounded animate-pulse w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSkeleton; 