import styles from './Gallery.module.css';

const GallerySkeleton = () => {
  return (
    <section className={styles.galleryContainer}>
      <div className={styles.galleryContent}>
        <div className={styles.header}>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 bg-white/5 rounded-lg animate-pulse w-64" />
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          </div>
        </div>

        <div className={styles.masonryGrid}>
          {[...Array(12)].map((_, index) => (
            <div 
              key={index} 
              className={`${styles.masonryItem} ${index % 3 === 0 ? styles.large : styles.small}`}
            >
              <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySkeleton; 