import { motion } from 'framer-motion';
import { XIcon } from '@/shared/components/common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './AIChatBox.module.css';
import { useBottomSheet } from '@/shared/hooks/useBottomSheet';

interface AIChatBoxProps {
  onClose: () => void;
}

const AIChatBox = ({ onClose }: AIChatBoxProps): JSX.Element | null => {
  const { t } = useCommonTranslation();
  const isMobile = window.innerWidth <= 768;
  const { activeSheet, setActiveSheet } = useBottomSheet();

  const handleClose = (): void => {
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
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>{t('aiChat.title')}</div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label={t('aiChat.closeChat')}
          >
            <XIcon className={styles.closeIcon} />
          </button>
        </div>

        {/* Chat Content */}
        <div className={styles.content}>
          <div className={styles.message}>{t('aiChat.greeting')}</div>
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder={t('aiChat.placeholder')}
            className={styles.input}
            autoFocus
          />
          <button className={styles.sendButton}>{t('aiChat.send')}</button>
        </div>
      </motion.div>
    </>
  );
};

export default AIChatBox;
