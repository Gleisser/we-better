import { motion } from 'framer-motion';
import styles from '../../WelcomeSequence.module.css';

interface AnimatedTitleProps {
  title?: string;
  subtitle?: string;
}

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const subtitleVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: "easeOut"
    }
  }
};

const AnimatedTitle = ({ 
  title = "Your Life Wheel Journey", 
  subtitle = "Discover balance and focus in all areas of your life with our interactive assessment"
}: AnimatedTitleProps) => {
  return (
    <div className={styles.titleContainer}>
      <motion.h1 
        className={styles.title}
        variants={titleVariants}
      >
        {title}
      </motion.h1>
      
      <motion.p 
        className={styles.subtitle}
        variants={subtitleVariants}
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

export default AnimatedTitle; 