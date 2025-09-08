import { motion } from 'framer-motion';
import { BookmarkIcon, MoreVerticalIcon, ShareIcon } from '@/shared/components/common/icons';
import { useBookmarkedQuotes, type BookmarkedQuote } from '@/shared/hooks/useBookmarkedQuotes';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useState, useMemo } from 'react';
import styles from './QuoteCard.module.css';

interface QuoteCardProps {
  quote: BookmarkedQuote;
  onRemove?: (id: string) => void;
}

const THEME_CONFIG: Record<string, { color: string; bgClass: string; icon: string }> = {
  success: { color: '#10B981', bgClass: 'bg-emerald-500/10', icon: '🎯' },
  motivation: { color: '#8B5CF6', bgClass: 'bg-purple-500/10', icon: '🔥' },
  leadership: { color: '#3B82F6', bgClass: 'bg-blue-500/10', icon: '👑' },
  growth: { color: '#F59E0B', bgClass: 'bg-amber-500/10', icon: '🌱' },
  wisdom: { color: '#EC4899', bgClass: 'bg-pink-500/10', icon: '✨' },
};

const QuoteCard = ({ quote, onRemove }: QuoteCardProps): JSX.Element => {
  const { removeBookmark } = useBookmarkedQuotes();
  const { t, currentLanguage } = useCommonTranslation();
  const [showMenu, setShowMenu] = useState(false);

  // Memoize translated values to prevent infinite re-renders
  const translations = useMemo(
    () => ({
      shareTitle: t('cards.quote.shareTitle') as string,
      shareAction: t('cards.quote.shareAction') as string,
      removeBookmark: t('cards.quote.removeBookmark') as string,
      moreOptions: t('cards.quote.moreOptions') as string,
    }),
    [t]
  );

  const themeConfig = THEME_CONFIG[quote.theme] || THEME_CONFIG.wisdom;

  const handleRemoveBookmark = (): void => {
    removeBookmark(quote.id);
    onRemove?.(quote.id);
    setShowMenu(false);
  };

  const handleShare = (): void => {
    const text = `"${quote.text}" - ${quote.author}`;
    if (navigator.share) {
      navigator.share({
        title: translations.shareTitle,
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
    setShowMenu(false);
  };

  const formatDate = (timestamp: number): string => {
    const locale = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(timestamp).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      className={styles.quoteCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.themeTag} style={{ backgroundColor: themeConfig.color }}>
          <span className={styles.themeIcon}>{themeConfig.icon}</span>
          <span className={styles.themeText}>{quote.theme}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
            aria-label={translations.moreOptions}
          >
            <MoreVerticalIcon className={styles.actionIcon} />
          </button>

          {showMenu && (
            <motion.div
              className={styles.menu}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <button className={styles.menuItem} onClick={handleShare}>
                <ShareIcon className={styles.menuIcon} />
                {translations.shareAction}
              </button>
              <button className={styles.menuItem} onClick={handleRemoveBookmark}>
                <BookmarkIcon className={styles.menuIcon} filled />
                {translations.removeBookmark}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quote Content */}
      <div className={styles.content}>
        <div className={styles.quoteIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
            <path d="M9.583 17.321C8.553 16.227 8 15.1 8 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707H8.867l.716-1.937zm7.42 0C16.973 16.227 16.42 15.1 16.42 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707h-3.778l.716-1.937z" />
          </svg>
        </div>

        <blockquote className={styles.quoteText}>{quote.text}</blockquote>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.author}>
          <span className={styles.authorName}>— {quote.author}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.bookmarkDate}>{formatDate(quote.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuoteCard;
