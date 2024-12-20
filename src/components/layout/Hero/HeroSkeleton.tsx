import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const HeroSkeleton = () => {
  return (
    <div className={styles.heroContainer}>
      {/* Keep the background blur effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <motion.div 
        className={styles.contentWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title skeleton */}
        <div className="space-y-4 w-full max-w-3xl mx-auto">
          <div className="h-14 bg-white/5 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-14 bg-white/5 rounded-lg animate-pulse w-1/2 mx-auto" />
        </div>

        {/* Subtitle skeleton */}
        <div className="h-6 bg-white/5 rounded-lg animate-pulse w-2/3 mx-auto mt-6" />

        {/* CTA buttons skeleton */}
        <div className={styles.ctaContainer}>
          <div className="h-12 bg-white/5 rounded-full animate-pulse w-40" />
          <div className="h-12 bg-white/5 rounded-full animate-pulse w-40" />
        </div>
      </motion.div>

      {/* Preview container skeleton */}
      <div className={styles.previewContainer}>
        <div className={styles.mainPreview}>
          {/* Main dashboard preview skeleton */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-white/5 to-white/10 rounded-[2rem] backdrop-blur-[2px] border border-white/20" />
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden backdrop-blur-sm bg-black/30 animate-pulse" />
          </div>
        </div>

        {/* Floating images skeleton */}
        <div className="absolute -top-20 -left-10 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="absolute -top-20 -right-10 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="absolute bottom-0 -left-32 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="absolute bottom-0 -right-32 w-[250px] h-[250px] rounded-3xl bg-white/5 animate-pulse" />
      </div>
    </div>
  );
};

export default HeroSkeleton; 