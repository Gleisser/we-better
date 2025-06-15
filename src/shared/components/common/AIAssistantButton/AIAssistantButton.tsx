import { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { SparkleIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import AIChatBox from './AIChatBox';
import styles from './AIAssistantButton.module.css';
import { useBottomSheet } from '@/shared/hooks/useBottomSheet';

const AIAssistantButton = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const controls = useAnimation();
  const { setActiveSheet } = useBottomSheet();

  // Particle configuration
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 12,
  }));

  const handleOpenChat = (): void => {
    setActiveSheet('aiChat');
    setIsChatOpen(true);
  };

  const handleCloseChat = (): void => {
    setActiveSheet(null);
    setIsChatOpen(false);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>{isChatOpen && <AIChatBox onClose={handleCloseChat} />}</AnimatePresence>

      {/* Particles */}
      {isHovered && (
        <div className={styles.particlesContainer}>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className={styles.particle}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, Math.cos(particle.angle) * 40],
                y: [0, Math.sin(particle.angle) * 40],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Button */}
      <motion.button
        className={styles.button}
        onClick={handleOpenChat}
        onHoverStart={() => {
          setIsHovered(true);
          controls.start({ pathLength: 1 });
        }}
        onHoverEnd={() => {
          setIsHovered(false);
          controls.start({ pathLength: 0 });
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Border Animation */}
        <svg className={styles.borderAnimation}>
          <motion.rect
            width="100%"
            height="100%"
            rx="24"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={controls}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Content */}
        <div className={`${styles.content} ${isHovered ? styles.hovered : ''}`}>
          <SparkleIcon className={styles.icon} />
          <span className={styles.text}>{t('floating.aiAssistant')}</span>
        </div>
      </motion.button>
    </div>
  );
};

export default AIAssistantButton;
