import { motion } from 'framer-motion';
import { ProgressIndicatorProps } from '../types';
import styles from '../WelcomeSequence.module.css';

const ProgressIndicator = ({ total, current }: ProgressIndicatorProps) => {
  return (
    <div className={styles.progressContainer}>
      {Array.from({ length: total }).map((_, idx) => (
        <motion.div
          key={idx}
          className={`${styles.progressDot} ${idx === current ? styles.progressActive : ''}`}
          initial={{ scale: idx === current ? 0.8 : 0.6, opacity: idx === current ? 0.8 : 0.4 }}
          animate={{ 
            scale: idx === current ? 1 : 0.6, 
            opacity: idx === current ? 1 : 0.4 
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator; 