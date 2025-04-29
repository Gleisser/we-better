import { useState } from 'react';
import { BookmarkIcon, ShareIcon, ArrowTopRight, InfoIcon, StarIcon } from '@/shared/components/common/icons';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { Book } from './types';
import { MOCK_BOOKS } from './config';
import styles from './BookWidget.module.css';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { useBookmarkedBooks } from '@/shared/hooks/useBookmarkedBooks';
import { BookDetailsModal } from './BookDetailsModal';

const BookWidget = () => {
  const [currentBook] = useState<Book>(MOCK_BOOKS[0]);
  const { theme } = useTimeBasedTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedBooks();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'topics' | 'why'>('topics');

  const formatReviewCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const calculateDiscount = (original: number, current: number): number => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentBook.title,
          text: `Check out "${currentBook.title}" by ${currentBook.author.name}`,
          url: currentBook.amazonUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div 
      className={styles.container}
      style={{
        '--gradient-start': theme.gradientStart,
        '--gradient-middle': theme.gradientMiddle,
        '--gradient-end': theme.gradientEnd,
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>📚</span>
          <span className={styles.headerText}>Recommended Book</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.bookCard}>
          <div className={styles.thumbnailSection}>
            <img 
              src={currentBook.thumbnail} 
              alt={currentBook.title}
              className={styles.thumbnail}
            />
            <div className={styles.matchScore}>
              {currentBook.matchScore}% Match
            </div>
          </div>

          <div className={styles.bookInfo}>
            <h3 className={styles.bookTitle}>{currentBook.title}</h3>
            
            <div className={styles.authorRow}>
              <span className={styles.authorName}>by {currentBook.author.name}</span>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.rating}>
                <StarIcon className={styles.starIcon} />
                <span>{currentBook.rating.toFixed(1)}</span>
              </div>
              <span>•</span>
              <div>
                {formatReviewCount(currentBook.reviewsCount)} reviews
              </div>
              <span>•</span>
              <div>
                {currentBook.pageCount} pages
              </div>
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.actionButtons}>
                <Tooltip content={isBookmarked(currentBook.id) ? "Remove bookmark" : "Bookmark book"}>
                  <button
                    className={`${styles.iconButton} ${isBookmarked(currentBook.id) ? styles.bookmarked : ''}`}
                    onClick={() => {
                      if (isBookmarked(currentBook.id)) {
                        removeBookmark(currentBook.id);
                      } else {
                        addBookmark(currentBook);
                      }
                    }}
                  >
                    <BookmarkIcon 
                      className={styles.actionIcon} 
                      filled={isBookmarked(currentBook.id)}
                    />
                  </button>
                </Tooltip>

                <Tooltip content="Share book">
                  <button
                    className={styles.iconButton}
                    onClick={handleShare}
                  >
                    <ShareIcon className={styles.actionIcon} />
                  </button>
                </Tooltip>

                <Tooltip content="Book description">
                  <button 
                    className={styles.iconButton}
                    onClick={() => {
                      setActiveTab('why');
                      setShowDetailsModal(true);
                    }}
                  >
                    <InfoIcon className={styles.actionIcon} />
                  </button>
                </Tooltip>
              </div>

              <div className={styles.priceSection}>
                <span className={styles.currentPrice}>${currentBook.price.current}</span>
                <span className={styles.discountBadge}>
                  {calculateDiscount(currentBook.price.original, currentBook.price.current)}% OFF
                </span>
              </div>
            </div>

            <a 
              href={currentBook.amazonUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.buyButton}
            >
              <span>Buy on Amazon</span>
              <ArrowTopRight className={styles.buyIcon} />
            </a>
          </div>
        </div>
      </div>

      <BookDetailsModal
        book={currentBook}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default BookWidget; 