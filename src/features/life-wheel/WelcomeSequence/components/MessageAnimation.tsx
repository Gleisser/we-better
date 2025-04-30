import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageAnimationProps } from '../types';
import styles from '../WelcomeSequence.module.css';

const MessageAnimation = ({
  message,
  onComplete,
  userName = '',
}: MessageAnimationProps): JSX.Element => {
  // Replace {name} placeholder with actual userName
  const processedText = message.text.replace('{name}', userName || 'there');

  // Split text to highlight specific words
  const getTextWithHighlights = (text: string, highlightWords: string[] = []): JSX.Element => {
    if (highlightWords.length === 0) return <span>{text}</span>;

    // Create parts by splitting on highlight words
    const parts: { text: string; highlight: boolean }[] = [];
    let remainingText = text;

    // For each highlight word, split the text and mark the parts
    highlightWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      const segments = remainingText.split(regex);

      segments.forEach(segment => {
        if (highlightWords.some(hw => segment.toLowerCase() === hw.toLowerCase())) {
          parts.push({ text: segment, highlight: true });
        } else if (segment) {
          parts.push({ text: segment, highlight: false });
        }
      });

      remainingText = ''; // After processing, clear the remaining text
    });

    // If no matches were found, just use the original text
    if (parts.length === 0) {
      parts.push({ text, highlight: false });
    }

    return (
      <>
        {parts.map((part, idx) =>
          part.highlight ? (
            <span key={idx} className={styles.highlight}>
              {part.text}
            </span>
          ) : (
            <span key={idx}>{part.text}</span>
          )
        )}
      </>
    );
  };

  // Animation variants
  const variants = {
    fadeUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
  };

  // Auto-advance after duration
  useEffect(() => {
    const timer = setTimeout(onComplete, message.duration);
    return () => clearTimeout(timer);
  }, [message.duration, onComplete]);

  const selectedVariant = variants[message.animation];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={styles.messageContainer}
        key={message.id}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.messageText}>
          {getTextWithHighlights(processedText, message.highlightWords)}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageAnimation;
