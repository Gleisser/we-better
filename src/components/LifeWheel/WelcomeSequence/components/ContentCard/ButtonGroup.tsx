import { motion } from 'framer-motion';
import styles from '../../WelcomeSequence.module.css';

interface ButtonGroupProps {
  onBegin: () => void;
  onSkip: () => void;
  beginLabel?: string;
  skipLabel?: string;
}

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut" 
    }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
  },
  tap: { scale: 0.98 }
};

const ButtonGroup = ({ 
  onBegin, 
  onSkip, 
  beginLabel = "Begin", 
  skipLabel = "Skip" 
}: ButtonGroupProps) => {
  return (
    <div className={styles.buttonContainer}>
      <motion.button
        className={styles.primaryButton}
        onClick={onBegin}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        aria-label={beginLabel}
      >
        {beginLabel}
      </motion.button>
      
      <motion.button
        className={styles.secondaryButton}
        onClick={onSkip}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        aria-label={skipLabel}
      >
        {skipLabel}
      </motion.button>
    </div>
  );
};

export default ButtonGroup; 