import { motion } from 'framer-motion';
import { LifeCategory } from '../../../types';
import styles from '../../WelcomeSequence.module.css';

interface FloatingIconsProps {
  categories: LifeCategory[];
}

const FloatingIcons = ({ categories }: FloatingIconsProps): JSX.Element => {
  return (
    <div className={styles.floatingIconsContainer}>
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          className={styles.floatingIcon}
          initial={{
            x: Math.random() * 60 - 30,
            y: Math.random() * 60 - 30,
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            y: [0, -20, 0],
            rotate: [0, index % 2 === 0 ? 10 : -10, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 5 + Math.random() * 5,
            delay: index * 0.3,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${10 + ((index * 35) % 80)}%`,
            top: `${15 + ((index * 20) % 70)}%`,
            filter: 'blur(0.5px)',
            zIndex: 5,
            fontSize: '24px',
            background: category.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {category.icon}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingIcons;
