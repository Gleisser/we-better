import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../WelcomeSequence.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

// Floating particle component for visual effect
const Particle = ({ 
  color = "rgba(139, 92, 246, 0.4)",
  size = Math.random() * 6 + 3,
  duration = Math.random() * 15 + 10
}) => {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size}px ${color}`,
        top: `${randomY}%`,
        left: `${randomX}%`,
        opacity: 0,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [0, -200 - Math.random() * 100],
        x: [0, (Math.random() - 0.5) * 100],
        opacity: [0, 0.4, 0],
        scale: [1, 1.2, 0.8]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "easeInOut"
      }}
    />
  );
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Prevent scrolling on body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        > 
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative corner shapes */}
            <motion.div
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 20,
                height: 20,
                borderTop: '2px solid rgba(139, 92, 246, 0.6)',
                borderRight: '2px solid rgba(139, 92, 246, 0.6)',
                opacity: 0
              }}
              animate={{ 
                opacity: 1,
                width: 40,
                height: 40
              }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 20,
                width: 20,
                height: 20,
                borderBottom: '2px solid rgba(236, 72, 153, 0.6)',
                borderLeft: '2px solid rgba(236, 72, 153, 0.6)',
                opacity: 0
              }}
              animate={{ 
                opacity: 1,
                width: 40,
                height: 40
              }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 