import styles from './Partners.module.css';

const PartnersSkeleton = () => {
  return (
    <section className={styles.partnersContainer}>
      <div className={styles.partnersContent}>
        {/* Title skeleton */}
        <div className="text-center mb-16">
          <div className="h-10 bg-white/5 rounded-lg animate-pulse w-64 mx-auto" />
        </div>
        
        <div className={styles.logoGrid}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={styles.logoContainer}>
              <div className="w-full h-full bg-white/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSkeleton; 