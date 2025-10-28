import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './QuoteWidget.module.css';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';

interface QuoteMoreOptionsMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onLearnMore: () => void;
  onBookRecommendations: () => void;
  onTakeaways: () => void;
  onSubmitQuote: () => void;
}

export const QuoteMoreOptionsMenu = ({
  isOpen,
  position,
  onClose,
  onLearnMore,
  onBookRecommendations,
  onTakeaways,
  onSubmitQuote,
}: QuoteMoreOptionsMenuProps): JSX.Element => {
  const { t } = useCommonTranslation();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <div className={styles.moreOptionsBackdrop} onClick={onClose} />
          <motion.div
            className={styles.moreOptionsMenu}
            style={{
              left: position.x,
              top: position.y,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <button onClick={onLearnMore} className={styles.moreOption}>
              <span className={styles.moreOptionIcon}>✨</span>
              <span>{t('widgets.quote.learnMore')}</span>
            </button>

            <button onClick={onBookRecommendations} className={styles.moreOption}>
              <span className={styles.moreOptionIcon}>📚</span>
              <span>{t('widgets.quote.bookRecommendations')}</span>
            </button>

            <button onClick={onTakeaways} className={styles.moreOption}>
              <span className={styles.moreOptionIcon}>💡</span>
              <span>{t('widgets.quote.quickTakeaways')}</span>
            </button>

            <div className={styles.menuDivider} />

            <button onClick={onSubmitQuote} className={styles.moreOption}>
              <span className={styles.moreOptionIcon}>✍️</span>
              <span>{t('widgets.quote.submitQuote')}</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
