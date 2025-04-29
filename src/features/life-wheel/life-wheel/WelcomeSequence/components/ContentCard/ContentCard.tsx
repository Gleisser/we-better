import { motion } from 'framer-motion';
import styles from '../../WelcomeSequence.module.css';

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: {
      duration: 0.4
    }
  }
};

const ContentCard = ({ children, className = '' }: ContentCardProps) => {
  return (
    <motion.div
      className={`${styles.contentCard} ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default ContentCard; 