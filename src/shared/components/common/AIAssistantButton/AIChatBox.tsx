import { motion } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import styles from './AIChatBox.module.css';
import { useBottomSheet } from '@/shared/contexts/BottomSheetContext';

interface AIChatBoxProps {
  onClose: () => void;
}

const AIChatBox = ({ onClose }: AIChatBoxProps) => {
  const isMobile = window.innerWidth <= 768;
  const { activeSheet, setActiveSheet } = useBottomSheet();

  const handleClose = () => {
    setActiveSheet(null);
    onClose();
  };

  // Only render if this is the active sheet
  if (isMobile && activeSheet !== 'aiChat') {
    return null;
  }

  return (
    <>
      {isMobile && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
      )}
      <motion.div 
        className={styles.container}
        initial={isMobile ? { y: '100%' } : { opacity: 0, y: 20 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
        exit={isMobile ? { y: '100%' } : { opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>AI Assistant</div>
          <button 
            onClick={handleClose}
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
    </>
  );
};

export default AIChatBox; 