import styles from './Testimonies.module.css';

const TestimoniesSkeleton = () => {
  return (
    <section className={styles.testimoniesContainer}>
      <div className={styles.testimoniesContent}>
        <div className={styles.header}>
          {/* Title skeleton */}
          <div className="space-y-4 text-center">
            <div className="h-10 bg-white/5 rounded-lg animate-pulse w-96 mx-auto" />
            <div className="h-6 bg-white/5 rounded-lg animate-pulse w-2/3 mx-auto" />
          </div>
        </div>

        <div className={styles.testimonials}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.testimonialCard}>
              {/* Testimony text skeleton */}
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-4/6" />
              </div>
              
              {/* Author skeleton */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimoniesSkeleton; 