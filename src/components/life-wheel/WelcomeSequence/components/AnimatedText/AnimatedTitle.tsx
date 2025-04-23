import { motion } from 'framer-motion';
import styles from './AnimatedTitle.module.css';

interface AnimatedTitleProps {
  title: string;
  subtitle?: string;
}

const AnimatedTitle = ({ title, subtitle }: AnimatedTitleProps) => {
  return (
    <div className={styles.titleContainer}>
      <motion.h1 
        className={styles.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedTitle; 