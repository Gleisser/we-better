import { motion } from 'framer-motion';
import styles from '../../WelcomeSequence.module.css';

const GradientBackground = () => {
  return (
    <motion.div 
      className={styles.backgroundGradient}
      animate={{
        background: [
          'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
          'linear-gradient(225deg, rgba(139, 92, 246, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%)',
          'linear-gradient(315deg, rgba(99, 102, 241, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
          'linear-gradient(45deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
        ]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    />
  );
};

export default GradientBackground; 