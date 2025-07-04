import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './QuoteWidget.module.css';
import { MoreVerticalIcon, RefreshIcon } from '../../common/icons';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { useTiltEffect } from '@/shared/hooks/useTiltEffect';
import { quoteService, type Quote } from '@/core/services/quoteService';

type QuoteTheme = 'success' | 'motivation' | 'leadership' | 'growth' | 'wisdom';

const QUOTE = {
  text: 'The only way to do great work is to love what you do.',
  author: 'Steve Jobs',
  theme: 'success' as QuoteTheme,
};

const THEME_CONFIG: Record<
  QuoteTheme,
  {
    color: string;
    icon: string;
    bgClass: string;
    borderClass: string;
    hoverClass: string;
  }
> = {
  success: {
    color: '#10B981',
    icon: '🎯',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    hoverClass: 'text-emerald-500',
  },
  motivation: {
    color: '#8B5CF6',
    icon: '🔥',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    hoverClass: 'text-purple-500',
  },
  leadership: {
    color: '#3B82F6',
    icon: '👑',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    hoverClass: 'text-blue-500',
  },
  growth: {
    color: '#F59E0B',
    icon: '🌱',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    hoverClass: 'text-amber-500',
  },
  wisdom: {
    color: '#EC4899',
    icon: '✨',
    bgClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/30',
    hoverClass: 'text-pink-500',
  },
};

const QuoteIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.583 17.321C8.553 16.227 8 15.1 8 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707H8.867l.716-1.937zm7.42 0C16.973 16.227 16.42 15.1 16.42 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707h-3.778l.716-1.937z" />
  </svg>
);

const BookmarkIcon = ({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}): JSX.Element => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
    />
  </svg>
);

type Reaction = '❤️' | '👏' | '💡' | '💪' | '🙏';

const REACTIONS: Reaction[] = ['❤️', '👏', '💡', '💪', '🙏'];

const LoadingSkeleton = (): JSX.Element => (
  <div className={styles.skeletonContent}>
    <div className={styles.skeletonTag} />
    <div className={styles.skeletonQuote}>
      <div className={styles.skeletonLine} style={{ width: '90%' }} />
      <div className={styles.skeletonLine} style={{ width: '85%' }} />
      <div className={styles.skeletonLine} style={{ width: '40%' }} />
    </div>
    <div className={styles.skeletonFooter}>
      <div className={styles.skeletonAuthor} />
      <div className={styles.skeletonActions} />
    </div>
  </div>
);

const QuoteWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const { theme } = useTimeBasedTheme();
  const { elementRef, tilt, handleMouseMove, handleMouseLeave } = useTiltEffect(5);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quotePool, setQuotePool] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{
    show: boolean;
    message: string;
    type: 'bookmark' | 'share';
  }>({
    show: false,
    message: '',
    type: 'bookmark',
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<Reaction, number>>({
    '❤️': 0,
    '👏': 0,
    '💡': 0,
    '💪': 0,
    '🙏': 0,
  });
  const [userReaction, setUserReaction] = useState<Reaction | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        !shareButtonRef.current?.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target as Node) &&
        !moreButtonRef.current?.contains(event.target as Node)
      ) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quoteService.getQuotes({
        sort: 'publishedAt:desc',
        pagination: {
          page: 1,
          pageSize: 15, // Fetch 15 quotes at once
        },
      });

      const mappedQuotes = quoteService.mapQuoteResponse(response);
      setQuotePool(mappedQuotes);
      // Set the first quote as current
      setQuote(mappedQuotes[0]);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      // Use a static error message to avoid dependency on t function
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleBookmark = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(prev => !prev);

    if (!isBookmarked) {
      setShowSuccess({
        show: true,
        message: t('widgets.quote.quoteBookmarked'),
        type: 'bookmark',
      });
      setTimeout(() => setShowSuccess(prev => ({ ...prev, show: false })), 2000);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'instagram'): void => {
    const quote = `"${QUOTE.text}" - ${QUOTE.author}`;
    const encodedQuote = encodeURIComponent(quote);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedQuote}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedQuote}`,
      instagram: `https://instagram.com/`,
    };

    if (platform === 'instagram') {
      navigator.clipboard.writeText(quote);
      setShowSuccess({
        show: true,
        message: t('widgets.quote.quoteCopied'),
        type: 'share',
      });
      setTimeout(() => setShowSuccess(prev => ({ ...prev, show: false })), 2000);
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }

    setShowShareMenu(false);
  };

  const handleCopyQuote = (): void => {
    const quote = `"${QUOTE.text}" - ${QUOTE.author}`;
    navigator.clipboard.writeText(quote);
    setShowSuccess({
      show: true,
      message: t('widgets.quote.quoteCopied') as string,
      type: 'share',
    });
    setTimeout(() => setShowSuccess(prev => ({ ...prev, show: false })), 2000);
  };

  const handleReaction = (reaction: Reaction): void => {
    if (userReaction === reaction) {
      setReactions(prev => ({
        ...prev,
        [reaction]: prev[reaction] - 1,
      }));
      setUserReaction(null);
    } else {
      if (userReaction) {
        setReactions(prev => ({
          ...prev,
          [userReaction]: prev[userReaction] - 1,
        }));
      }
      setReactions(prev => ({
        ...prev,
        [reaction]: prev[reaction] + 1,
      }));
      setUserReaction(reaction);
    }
    setShowReactions(false);
  };

  const handleLearnMore = (): void => {
    setShowMoreOptions(false);
  };

  const handleBookRecommendations = (): void => {
    setShowMoreOptions(false);
  };

  const handleTakeaways = (): void => {
    setShowMoreOptions(false);
  };

  const handleSubmitQuote = (): void => {
    setShowMoreOptions(false);
  };

  const handleNewQuote = (): void => {
    if (quotePool.length === 0) {
      // If we've used all quotes, fetch new ones
      fetchQuotes();
      return;
    }

    // Get current quote index
    const currentIndex = quote ? quotePool.findIndex(q => q.id === quote.id) : -1;

    // Get next quote (randomly from the pool, excluding current quote)
    const availableQuotes = quotePool.filter((_, index) => index !== currentIndex);
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const nextQuote = availableQuotes[randomIndex];

    // If we're running low on quotes (e.g., only 5 left), fetch more
    if (availableQuotes.length <= 5) {
      fetchQuotes();
    }

    setQuote(nextQuote);
  };

  return (
    <div
      ref={elementRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--gradient-start': theme.gradientStart,
          '--gradient-middle': theme.gradientMiddle,
          '--gradient-end': theme.gradientEnd,
          '--accent-rgb': theme.accentRGB,
          transform: `perspective(1000px) 
                   rotateX(${tilt.rotateX}deg) 
                   rotateY(${tilt.rotateY}deg)
                   scale(${tilt.scale})`,
          transition: 'transform 0.1s ease-out',
        } as React.CSSProperties
      }
    >
      <div className={styles.backgroundGradient} />

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <QuoteIcon className={styles.headerIcon} />
            </div>
            <span className={styles.headerText}>{t('widgets.quote.title')}</span>
          </div>

          <div className={styles.actions}>
            <div className={styles.shareWrapper}>
              <button
                ref={shareButtonRef}
                type="button"
                className={styles.actionButton}
                onClick={() => setShowShareMenu(!showShareMenu)}
                aria-label={t('widgets.quote.shareQuote')}
              >
                <ShareIcon className={styles.actionIcon} />
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    ref={shareMenuRef}
                    className={styles.shareMenu}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <button onClick={() => handleShare('facebook')} className={styles.shareOption}>
                      <FacebookIcon className={styles.socialIcon} />
                      <span>Facebook</span>
                    </button>
                    <button onClick={() => handleShare('twitter')} className={styles.shareOption}>
                      <TwitterIcon className={styles.socialIcon} />
                      <span>X (Twitter)</span>
                    </button>
                    <button onClick={() => handleShare('instagram')} className={styles.shareOption}>
                      <InstagramIcon className={styles.socialIcon} />
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
                onMouseEnter={e => {
                  e.stopPropagation();
                  setShowTooltip(true);
                }}
                onMouseLeave={e => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                aria-label={
                  isBookmarked
                    ? t('widgets.quote.removeBookmark')
                    : t('widgets.quote.bookmarkQuote')
                }
                style={{ position: 'relative', zIndex: 2 }}
              >
                <BookmarkIcon className={styles.bookmarkIcon} filled={isBookmarked} />
              </button>

              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    className={styles.tooltip}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    {isBookmarked
                      ? t('widgets.quote.removeBookmark')
                      : t('widgets.quote.bookmarkQuote')}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSuccess.show && (
                  <motion.div
                    className={`${styles.successMessage} ${
                      showSuccess.type === 'share' ? styles.shareSuccess : styles.bookmarkSuccess
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {showSuccess.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.moreOptionsWrapper}>
              <button
                ref={moreButtonRef}
                type="button"
                className={styles.actionButton}
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                aria-label={t('widgets.quote.moreOptions')}
              >
                <MoreVerticalIcon className={styles.actionIcon} />
              </button>

              <AnimatePresence>
                {showMoreOptions && (
                  <motion.div
                    ref={moreOptionsRef}
                    className={styles.moreOptionsMenu}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <button onClick={handleLearnMore} className={styles.moreOption}>
                      <span className={styles.moreOptionIcon}>✨</span>
                      <span>{t('widgets.quote.learnMore')}</span>
                    </button>

                    <button onClick={handleBookRecommendations} className={styles.moreOption}>
                      <span className={styles.moreOptionIcon}>📚</span>
                      <span>{t('widgets.quote.bookRecommendations')}</span>
                    </button>

                    <button onClick={handleTakeaways} className={styles.moreOption}>
                      <span className={styles.moreOptionIcon}>💡</span>
                      <span>{t('widgets.quote.quickTakeaways')}</span>
                    </button>

                    <div className={styles.menuDivider} />

                    <button onClick={handleSubmitQuote} className={styles.moreOption}>
                      <span className={styles.moreOptionIcon}>✍️</span>
                      <span>{t('widgets.quote.submitQuote')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorMessage}>{t('widgets.quote.failedToLoad')}</span>
            <button onClick={fetchQuotes} className={styles.retryButton}>
              {t('widgets.quote.tryAgain')}
            </button>
          </div>
        ) : quote ? (
          <motion.div
            className={styles.quoteContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className={`${styles.themeTag} hover:${THEME_CONFIG[quoteService.determineQuoteTheme(quote.categories)].bgClass} hover:${THEME_CONFIG[quoteService.determineQuoteTheme(quote.categories)].borderClass}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className={styles.themeIcon}>
                {THEME_CONFIG[quoteService.determineQuoteTheme(quote.categories)].icon}
              </span>
              <span
                className={`${styles.themeText} hover:${THEME_CONFIG[quoteService.determineQuoteTheme(quote.categories)].hoverClass}`}
              >
                {quoteService.determineQuoteTheme(quote.categories).charAt(0).toUpperCase() +
                  quoteService.determineQuoteTheme(quote.categories).slice(1)}
              </span>
            </motion.div>

            <motion.div
              className={styles.quoteText}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.03,
                  },
                },
              }}
            >
              {quote.text.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  className={styles.word}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            <div className={styles.quoteFooter}>
              <motion.div
                className={styles.author}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
              >
                - {quote.author}
              </motion.div>

              <div className={styles.bottomActions}>
                <div className={styles.reactionsWrapper}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${userReaction ? styles.hasReaction : ''}`}
                    onClick={() => setShowReactions(!showReactions)}
                    aria-label="React to quote"
                  >
                    <span className={styles.reactionIcon}>{userReaction || '🤍'}</span>
                  </button>

                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        className={styles.reactionsMenu}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                      >
                        {REACTIONS.map(reaction => (
                          <button
                            key={reaction}
                            onClick={() => handleReaction(reaction)}
                            className={`${styles.reactionOption} ${
                              userReaction === reaction ? styles.selectedReaction : ''
                            }`}
                          >
                            <span className={styles.reactionEmoji}>{reaction}</span>
                            <span className={styles.reactionCount}>{reactions[reaction]}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.newQuoteButton}`}
                  onClick={handleNewQuote}
                  aria-label="Get new quote"
                  disabled={loading}
                >
                  <RefreshIcon
                    className={`${styles.actionIcon} ${loading ? styles.spinning : ''}`}
                  />
                </button>

                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={handleCopyQuote}
                  aria-label="Copy quote"
                >
                  <CopyIcon className={styles.actionIcon} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default QuoteWidget;
