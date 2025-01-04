import { motion } from 'framer-motion';
import { XIcon } from '@/components/common/icons';
import styles from './AIChatBox.module.css';

interface AIChatBoxProps {
  onClose: () => void;
}

const AIChatBox = ({ onClose }: AIChatBoxProps) => {
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <button 
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close chat"
        >
          <XIcon className={styles.closeIcon} />
        </button>
      </div>

      {/* Chat Content */}
      <div className={styles.content}>
        <div className={styles.message}>
          How can I help you today?
        </div>
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your message..."
          className={styles.input}
          autoFocus
        />
        <button className={styles.sendButton}>
          Send
        </button>
      </div>
    </motion.div>
  );
};

export default AIChatBox; 