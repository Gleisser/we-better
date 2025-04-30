import { motion } from 'framer-motion';
import styles from '../../WelcomeSequence.module.css';

interface ButtonGroupProps {
  onBegin: () => void;
  onSkip: () => void;
  beginLabel?: string;
  skipLabel?: string;
}

const ButtonGroup = ({
  onBegin,
  onSkip,
  beginLabel = 'Begin Journey',
  skipLabel = 'Skip Intro',
}: ButtonGroupProps): JSX.Element => {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.buttonWrapper}>
        <motion.button
          className={styles.primaryButton}
          onClick={onBegin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {beginLabel}
        </motion.button>

        <motion.button className={styles.skipButton} onClick={onSkip} whileHover={{ opacity: 0.9 }}>
          {skipLabel}
        </motion.button>
      </div>
    </div>
  );
};

export default ButtonGroup;
