import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styles from './QuoteWidget.module.css';

const QUOTE = {
  text: "The only way to do great work is to love what you do.",
  author: "Steve Jobs"
};

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M9.583 17.321C8.553 16.227 8 15.1 8 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707H8.867l.716-1.937zm7.42 0C16.973 16.227 16.42 15.1 16.42 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707h-3.778l.716-1.937z" />
  </svg>
);

const BookmarkIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

const QuoteWidget = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
    
    if (!isBookmarked) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'instagram') => {
    const quote = `"${QUOTE.text}" - ${QUOTE.author}`;
    const encodedQuote = encodeURIComponent(quote);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedQuote}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedQuote}`,
      instagram: `https://instagram.com/` // Instagram doesn't support direct sharing, we could copy to clipboard instead
    };

    if (platform === 'instagram') {
      navigator.clipboard.writeText(quote);
      // Show success message
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className={styles.container} style={{ position: 'relative', zIndex: 1 }}>
      <div className={styles.backgroundGradient} />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <QuoteIcon className={styles.headerIcon} />
            </div>
            <span className={styles.headerText}>Quote of the day</span>
          </div>
          
          <div className={styles.actions}>
            <div className={styles.shareWrapper}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setShowShareMenu(!showShareMenu)}
                onMouseEnter={() => setShowShareMenu(true)}
                onMouseLeave={() => setShowShareMenu(false)}
                aria-label="Share quote"
              >
                <ShareIcon className={styles.actionIcon} />
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    className={styles.shareMenu}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <button
                      onClick={() => handleShare('facebook')}
                      className={styles.shareOption}
                    >
                      <img 
                        src="/assets/images/social/facebook.svg" 
                        alt="Share on Facebook"
                        className={styles.socialIcon}
                      />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className={styles.shareOption}
                    >
                      <img 
                        src="/assets/images/social/x-twitter.svg" 
                        alt="Share on X"
                        className={styles.socialIcon}
                      />
                      <span>X (Twitter)</span>
                    </button>
                    <button
                      onClick={() => handleShare('instagram')}
                      className={styles.shareOption}
                    >
                      <img 
                        src="/assets/images/social/instagram.svg" 
                        alt="Share on Instagram"
                        className={styles.socialIcon}
                      />
                      <span>Instagram</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.bookmarkWrapper}>
              <button
                type="button"
                className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''}`}
                onClick={handleBookmark}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setShowTooltip(true);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark quote'}
                style={{ position: 'relative', zIndex: 2 }}
              >
                <BookmarkIcon 
                  className={styles.bookmarkIcon} 
                  filled={isBookmarked}
                />
              </button>

              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    className={styles.tooltip}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    {isBookmarked ? 'Remove bookmark' : 'Bookmark quote'}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    className={styles.successMessage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Quote bookmarked!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Quote Content */}
        <motion.div 
          className={styles.quoteContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className={styles.quoteText}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.03
                }
              }
            }}
          >
            {QUOTE.text.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className={styles.word}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          <motion.div 
            className={styles.author}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          >
            - {QUOTE.author}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuoteWidget; 