import { motion } from 'framer-motion';
import { BookmarkIcon, MoreVerticalIcon, ShareIcon } from '@/shared/components/common/icons';
import {
  useBookmarkedAffirmations,
  type BookmarkedAffirmation,
} from '@/shared/hooks/useBookmarkedAffirmations';
import { useState } from 'react';
import styles from './AffirmationCard.module.css';

interface AffirmationCardProps {
  affirmation: BookmarkedAffirmation;
  onRemove?: (id: string) => void;
}

const CATEGORY_CONFIG: Record<string, { color: string; icon: string; gradient: string }> = {
  confidence: { color: '#3B82F6', icon: '💪', gradient: 'from-blue-500 to-blue-600' },
  motivation: { color: '#8B5CF6', icon: '🔥', gradient: 'from-purple-500 to-purple-600' },
  success: { color: '#10B981', icon: '🎯', gradient: 'from-emerald-500 to-emerald-600' },
  health: { color: '#F59E0B', icon: '🌟', gradient: 'from-amber-500 to-amber-600' },
  relationships: { color: '#EC4899', icon: '💝', gradient: 'from-pink-500 to-pink-600' },
  gratitude: { color: '#14B8A6', icon: '🙏', gradient: 'from-teal-500 to-teal-600' },
  peace: { color: '#6366F1', icon: '🕊️', gradient: 'from-indigo-500 to-indigo-600' },
};

const AffirmationCard = ({ affirmation, onRemove }: AffirmationCardProps): JSX.Element => {
  const { removeBookmark } = useBookmarkedAffirmations();
  const [showMenu, setShowMenu] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[affirmation.category] || CATEGORY_CONFIG.confidence;

  const handleRemoveBookmark = (): void => {
    removeBookmark(affirmation.id);
    onRemove?.(affirmation.id);
    setShowMenu(false);
  };

  const handleShare = (): void => {
    const text = `${affirmation.text}`;
    if (navigator.share) {
      navigator.share({
        title: 'Positive Affirmation',
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
    setShowMenu(false);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      className={styles.affirmationCard}
      style={
        {
          '--category-color': categoryConfig.color,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.categoryTag} style={{ color: categoryConfig.color }}>
          <span className={styles.categoryIcon}>{categoryConfig.icon}</span>
          <span className={styles.categoryText}>{affirmation.category}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More options"
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
                Share Affirmation
              </button>
              <button className={styles.menuItem} onClick={handleRemoveBookmark}>
                <BookmarkIcon className={styles.menuIcon} filled />
                Remove Bookmark
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.affirmationIcon}>
          <div
            className={styles.iconCircle}
            style={{ backgroundColor: `${categoryConfig.color}15`, color: categoryConfig.color }}
          >
            ✨
          </div>
        </div>

        <p className={styles.affirmationText}>{affirmation.text}</p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.type}>
          <span className={styles.typeLabel}>Affirmation</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.bookmarkDate}>{formatDate(affirmation.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AffirmationCard;
