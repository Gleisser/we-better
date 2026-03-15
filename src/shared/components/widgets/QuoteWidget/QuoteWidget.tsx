import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import styles from './QuoteWidget.module.css';
import { MoreVerticalIcon, RefreshIcon } from '../../common/icons';
import { LottieLightIcon } from '@/shared/components/common/LottieLightIcon';
import { AnimatedWebPIcon } from '@/shared/components/common/AnimatedWebPIcon';
import { useDashboardTranslation } from '@/shared/hooks/useTranslation';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import { useTiltEffect } from '@/shared/hooks/useTiltEffect';
import { quoteService, type Quote } from '@/core/services/quoteService';
import { QuoteMoreOptionsMenu } from './QuoteMoreOptionsMenu';
import { SafeBookmarkIcon, SafeShareIcon } from './SafeAnimatedIcons';
import { useQuotePool } from '@/features/quotes/hooks/useQuotePool';
import { useBookmarkedQuotes } from '@/shared/hooks/useBookmarkedQuotes';
import shareLottie from './icons/share.json';
import bookmarkLottie from './icons/bookmark.json';
import refreshLottie from './icons/refresh.json';
import clipboardLottie from './icons/clipboard.json';
import likeWebP from './icons/like.webp';
import likeIdleWebP from './icons/like-idle.webp';

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

const BACKGROUND_IMAGES: Record<QuoteTheme, string[]> = {
  success: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80',
  ],
  motivation: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80',
  ],
  leadership: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1600&q=80',
  ],
  growth: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
  ],
  wisdom: [
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  ],
};

const QuoteIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.583 17.321C8.553 16.227 8 15.1 8 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707H8.867l.716-1.937zm7.42 0C16.973 16.227 16.42 15.1 16.42 13.725c0-1.426.397-2.772 1.191-3.693.794-.92 1.859-1.381 3.191-1.381v2.014c-1.326 0-1.989.724-1.989 2.172 0 .397.079.794.238 1.191l2.014-.477v5.707h-3.778l.716-1.937z" />
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 9V6.75A2.75 2.75 0 0 1 11.75 4h6.5A2.75 2.75 0 0 1 21 6.75v6.5A2.75 2.75 0 0 1 18.25 16H16"
    />
    <rect x="3" y="8" width="13" height="13" rx="2.75" strokeWidth={2} />
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
  const { t } = useDashboardTranslation();
  const { theme } = useTimeBasedTheme();
  const { elementRef, tilt, handleMouseMove, handleMouseLeave } = useTiltEffect(5);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quotePool, setQuotePool] = useState<Quote[]>([]);
  const [isFetchingNextQuote, setIsFetchingNextQuote] = useState(false);
  const [backgroundIndices, setBackgroundIndices] = useState<Record<QuoteTheme, number>>({
    success: 0,
    motivation: 0,
    leadership: 0,
    growth: 0,
    wisdom: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

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
  const [moreMenuPosition, setMoreMenuPosition] = useState({ x: 0, y: 0 });
  const [likeAnimationTick, setLikeAnimationTick] = useState(0);
  const [shareAnimationTick, setShareAnimationTick] = useState(0);
  const [bookmarkAnimationTick, setBookmarkAnimationTick] = useState(0);
  const [refreshAnimationTick, setRefreshAnimationTick] = useState(0);
  const [clipboardAnimationTick, setClipboardAnimationTick] = useState(0);

  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const quoteTextRef = useRef<HTMLDivElement>(null);

  const {
    data: fetchedQuotes,
    isLoading: isQuotePoolLoading,
    isError: isQuotePoolError,
    error: quotePoolError,
    refetch: refetchQuotePool,
  } = useQuotePool();
  const {
    addBookmark,
    removeBookmark,
    isBookmarked: isQuoteBookmarked,
    isBookmarkActionPending,
  } = useBookmarkedQuotes();

  useEffect(() => {
    if (Array.isArray(fetchedQuotes) && fetchedQuotes.length > 0) {
      setQuotePool(fetchedQuotes);
    }
  }, [fetchedQuotes]);

  useEffect(() => {
    if (!quote && quotePool.length > 0) {
      setQuote(quotePool[0]);
    }
  }, [quote, quotePool]);

  const fetchError =
    isQuotePoolError && quotePoolError
      ? quotePoolError instanceof Error
        ? quotePoolError.message
        : (t('widgets.quote.failedToLoad') as string)
      : null;

  const isInitialLoading = isQuotePoolLoading && !quote;
  const showLoadingSkeleton = isInitialLoading && !fetchError;
  const isNextQuoteBusy = isFetchingNextQuote || isInitialLoading;

  const resolvedTheme = quote ? quoteService.determineQuoteTheme(quote.categories) : QUOTE.theme;
  const activeQuoteText = quote?.text ?? QUOTE.text;
  const activeQuoteAuthor = quote?.author ?? QUOTE.author;
  const currentQuoteId = quote?.documentId;
  const isCurrentQuoteBookmarked = currentQuoteId ? isQuoteBookmarked(currentQuoteId) : false;
  const isCurrentQuoteBookmarkPending = currentQuoteId
    ? isBookmarkActionPending(currentQuoteId)
    : false;
  const themeConfig = THEME_CONFIG[resolvedTheme];
  const themeBackgrounds = BACKGROUND_IMAGES[resolvedTheme] ?? BACKGROUND_IMAGES.success;
  const backgroundIndex = backgroundIndices[resolvedTheme] ?? 0;
  const backgroundImage =
    themeBackgrounds[backgroundIndex % themeBackgrounds.length] ?? BACKGROUND_IMAGES.success[0];
  const rawCategoryLabel =
    quote?.categories?.[0]?.name ?? resolvedTheme.charAt(0).toUpperCase() + resolvedTheme.slice(1);
  const categoryLabel = rawCategoryLabel.toUpperCase();
  const readMoreLabel = (t('widgets.common.readMore') as string) || 'Read more';
  const showLessLabel = (t('widgets.common.showLess') as string) || 'Show less';

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

  const triggerShareAnimation = (): void => {
    setShareAnimationTick(previous => previous + 1);
  };

  const triggerLikeAnimation = (): void => {
    setLikeAnimationTick(previous => previous + 1);
  };

  const triggerBookmarkAnimation = (): void => {
    setBookmarkAnimationTick(previous => previous + 1);
  };

  const triggerRefreshAnimation = (): void => {
    setRefreshAnimationTick(previous => previous + 1);
  };

  const triggerClipboardAnimation = (): void => {
    setClipboardAnimationTick(previous => previous + 1);
  };

  const handleShareButtonClick = (): void => {
    triggerShareAnimation();
    setShowShareMenu(prev => !prev);
  };

  useEffect(() => {
    if (!showMoreOptions) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setShowMoreOptions(false);
      }
    };

    const handleDismiss = (): void => {
      setShowMoreOptions(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [showMoreOptions]);

  useEffect(() => {
    setIsExpanded(false);
  }, [quote?.id]);

  useEffect(() => {
    const element = quoteTextRef.current;
    if (!element) {
      setIsOverflowing(false);
      return;
    }

    const computeOverflow = (): void => {
      if (!quoteTextRef.current) {
        return;
      }

      const style = window.getComputedStyle(quoteTextRef.current);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const fontSize = Number.parseFloat(style.fontSize);
      const rowGap = Number.parseFloat(style.rowGap ?? '0');
      const fallbackLineHeight = Number.isFinite(fontSize) && fontSize > 0 ? fontSize * 1.5 : 0;
      const normalizedLineHeight =
        Number.isFinite(lineHeight) && lineHeight > 0
          ? lineHeight
          : fallbackLineHeight > 0
            ? fallbackLineHeight
            : quoteTextRef.current.clientHeight || 0;
      const gapAllowance = Number.isFinite(rowGap) && rowGap > 0 ? rowGap * 4 : 0;
      const maxAllowedHeight = Math.max(normalizedLineHeight * 5 + gapAllowance, 0);

      setCollapsedHeight(maxAllowedHeight);

      const shouldClamp = quoteTextRef.current.scrollHeight - 1 > maxAllowedHeight;
      setIsOverflowing(shouldClamp);
    };

    const rafId = window.requestAnimationFrame(computeOverflow);
    window.addEventListener('resize', computeOverflow);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', computeOverflow);
    };
  }, [quote?.text, resolvedTheme]);

  const handleBookmark = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!quote?.documentId || isCurrentQuoteBookmarkPending) {
      return;
    }

    triggerBookmarkAnimation();

    try {
      if (isCurrentQuoteBookmarked) {
        await removeBookmark(quote.documentId);
        return;
      }

      await addBookmark({
        id: quote.documentId,
        text: quote.text,
        author: quote.author,
        theme: resolvedTheme,
        timestamp: Date.now(),
      });

      setShowSuccess({
        show: true,
        message: t('widgets.quote.quoteBookmarked'),
        type: 'bookmark',
      });
      setTimeout(() => setShowSuccess(prev => ({ ...prev, show: false })), 2000);
    } catch (error) {
      console.error('Failed to update quote bookmark:', error);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'instagram'): void => {
    const shareText = `"${activeQuoteText}" - ${activeQuoteAuthor}`;
    const encodedQuote = encodeURIComponent(shareText);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedQuote}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedQuote}`,
      instagram: `https://instagram.com/`,
    };

    if (platform === 'instagram') {
      navigator.clipboard.writeText(shareText);
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
    triggerClipboardAnimation();
    const shareText = `"${activeQuoteText}" - ${activeQuoteAuthor}`;
    navigator.clipboard.writeText(shareText);
    setShowSuccess({
      show: true,
      message: t('widgets.quote.quoteCopied') as string,
      type: 'share',
    });
    setTimeout(() => setShowSuccess(prev => ({ ...prev, show: false })), 2000);
  };

  const handleReaction = (reaction: Reaction): void => {
    triggerLikeAnimation();

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

  const toggleMoreOptions = (): void => {
    if (showMoreOptions) {
      setShowMoreOptions(false);
      return;
    }

    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const horizontalPadding = 16;
      const verticalOffset = 12;

      const calculatedX = Math.max(
        horizontalPadding,
        Math.min(rect.left, window.innerWidth - menuWidth - horizontalPadding)
      );

      setMoreMenuPosition({
        x: calculatedX,
        y: rect.bottom + verticalOffset,
      });
    }

    setShowMoreOptions(true);
  };

  const handleNewQuote = async (): Promise<void> => {
    if (isFetchingNextQuote) {
      return;
    }

    setIsFetchingNextQuote(true);

    try {
      const result = await refetchQuotePool({
        throwOnError: false,
      });

      const updatedQuotes = result.data && result.data.length ? result.data : quotePool;

      if (!updatedQuotes.length) {
        return;
      }

      setQuotePool(updatedQuotes);

      const currentIndex = quote ? updatedQuotes.findIndex(q => q.id === quote.id) : -1;
      const availableQuotes =
        currentIndex >= 0
          ? updatedQuotes.filter((_, index) => index !== currentIndex)
          : updatedQuotes;

      const nextQuote =
        availableQuotes.length > 0
          ? availableQuotes[Math.floor(Math.random() * availableQuotes.length)]
          : updatedQuotes[0];

      const nextTheme = quoteService.determineQuoteTheme(nextQuote.categories);
      setBackgroundIndices(prev => {
        const previousIndex = prev[nextTheme] ?? 0;
        const themeBackgrounds = BACKGROUND_IMAGES[nextTheme] ?? BACKGROUND_IMAGES.success;
        const updatedIndex = (previousIndex + 1) % themeBackgrounds.length;

        return {
          ...prev,
          [nextTheme]: updatedIndex,
        };
      });

      setQuote(nextQuote);
      setIsExpanded(false);
    } finally {
      setIsFetchingNextQuote(false);
    }
  };

  return (
    <div
      ref={elementRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--background-image': `url(${backgroundImage})`,
          '--accent-color': themeConfig.color,
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
      <div className={styles.mediaLayer} />
      <div className={styles.mediaOverlay} />
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div className={styles.actionsCluster}>
            <div className={styles.shareWrapper}>
              <button
                ref={shareButtonRef}
                type="button"
                className={styles.actionButton}
                onClick={handleShareButtonClick}
                onMouseEnter={triggerShareAnimation}
                onFocus={triggerShareAnimation}
                aria-label={t('widgets.quote.shareQuote')}
              >
                <span className={`${styles.actionIcon} ${styles.safeShareWrapper}`}>
                  <LottieLightIcon
                    animationData={shareLottie}
                    className={styles.lottieLightIcon}
                    colorOverride="currentColor"
                    replayKey={shareAnimationTick}
                    fallback={<SafeShareIcon className={styles.safeShareReplay} />}
                  />
                </span>
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
                className={`${styles.actionButton} ${
                  isCurrentQuoteBookmarked ? styles.bookmarked : ''
                }`}
                onClick={event => {
                  void handleBookmark(event);
                }}
                onMouseEnter={e => {
                  e.stopPropagation();
                  setShowTooltip(true);
                  triggerBookmarkAnimation();
                }}
                onFocus={e => {
                  e.stopPropagation();
                  setShowTooltip(true);
                  triggerBookmarkAnimation();
                }}
                onMouseLeave={e => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                aria-label={
                  isCurrentQuoteBookmarked
                    ? t('widgets.quote.removeBookmark')
                    : t('widgets.quote.bookmarkQuote')
                }
                aria-pressed={isCurrentQuoteBookmarked}
                disabled={!currentQuoteId || isCurrentQuoteBookmarkPending}
                style={{ position: 'relative', zIndex: 2 }}
              >
                <span className={`${styles.actionIcon} ${styles.bookmarkIcon}`}>
                  <LottieLightIcon
                    animationData={bookmarkLottie}
                    className={styles.lottieLightIcon}
                    colorOverride="currentColor"
                    replayKey={`${bookmarkAnimationTick}-${isCurrentQuoteBookmarked ? 'filled' : 'idle'}`}
                    settleTo={isCurrentQuoteBookmarked ? 'end' : 'start'}
                    fallback={
                      <SafeBookmarkIcon
                        className={styles.safeBookmarkReplay}
                        filled={isCurrentQuoteBookmarked}
                      />
                    }
                  />
                </span>
              </button>

              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    className={styles.tooltip}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    {isCurrentQuoteBookmarked
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
                onClick={toggleMoreOptions}
                aria-label={t('widgets.quote.moreOptions')}
              >
                <MoreVerticalIcon className={styles.actionIcon} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.glassCard}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.iconWrapper}>
                <QuoteIcon className={styles.headerIcon} />
              </div>
              <span className={styles.headerText}>{t('widgets.quote.title')}</span>
            </div>
          </div>

          <div className={styles.contentArea}>
            {fetchError ? (
              <div className={styles.error}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorMessage}>{fetchError}</div>
                <button
                  className={styles.retryButton}
                  onClick={() => {
                    void refetchQuotePool({ throwOnError: false });
                  }}
                >
                  {t('widgets.common.retry')}
                </button>
              </div>
            ) : showLoadingSkeleton ? (
              <LoadingSkeleton />
            ) : quote ? (
              <motion.div
                className={styles.quoteContent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className={`${styles.quoteTextWrapper} ${
                    isExpanded ? styles.expandedText : styles.collapsedText
                  }`}
                  style={
                    !isExpanded && collapsedHeight
                      ? { maxHeight: `${collapsedHeight}px` }
                      : undefined
                  }
                >
                  <motion.div
                    ref={quoteTextRef}
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
                </div>

                {isOverflowing ? (
                  <button
                    type="button"
                    className={styles.toggleTextButton}
                    onClick={() => setIsExpanded(prev => !prev)}
                  >
                    {isExpanded ? showLessLabel : readMoreLabel}
                  </button>
                ) : null}

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
                        className={`${styles.actionButton} ${styles.gradientButton} ${
                          userReaction ? styles.hasReaction : ''
                        }`}
                        onClick={() => {
                          triggerLikeAnimation();
                          setShowReactions(!showReactions);
                        }}
                        onMouseEnter={triggerLikeAnimation}
                        onFocus={triggerLikeAnimation}
                        aria-label={t('widgets.quote.reactToQuote') as string}
                      >
                        <span
                          className={`${styles.actionIcon} ${styles.reactionIcon} ${styles.iconPulse}`}
                        >
                          <AnimatedWebPIcon
                            className={styles.lottieLightIcon}
                            replayKey={likeAnimationTick}
                            posterSrc={likeIdleWebP}
                            src={likeWebP}
                          />
                        </span>
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
                      className={`${styles.actionButton} ${styles.gradientButton}`}
                      onClick={() => {
                        triggerRefreshAnimation();
                        void handleNewQuote();
                      }}
                      onMouseEnter={triggerRefreshAnimation}
                      onFocus={triggerRefreshAnimation}
                      aria-label={t('widgets.quote.getNewQuote') as string}
                      disabled={isNextQuoteBusy}
                    >
                      <span
                        className={`${styles.actionIcon} ${styles.refreshIcon} ${styles.iconRotate} ${
                          isNextQuoteBusy ? styles.iconSpinning : ''
                        }`}
                      >
                        <LottieLightIcon
                          animationData={refreshLottie}
                          className={styles.lottieLightIcon}
                          colorOverride="currentColor"
                          replayKey={refreshAnimationTick}
                          fallback={<RefreshIcon />}
                        />
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.gradientButton}`}
                      onClick={handleCopyQuote}
                      onMouseEnter={triggerClipboardAnimation}
                      onFocus={triggerClipboardAnimation}
                      aria-label={t('widgets.quote.copyQuote') as string}
                    >
                      <span className={`${styles.actionIcon} ${styles.iconSlide}`}>
                        <LottieLightIcon
                          animationData={clipboardLottie}
                          className={styles.lottieLightIcon}
                          colorOverride="currentColor"
                          replayKey={clipboardAnimationTick}
                          fallback={<CopyIcon />}
                        />
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        <div className={styles.tagBadge}>
          <span className={styles.tagIcon}>{themeConfig.icon}</span>
          <span className={styles.tagText}>{categoryLabel}</span>
        </div>
      </div>
      <QuoteMoreOptionsMenu
        isOpen={showMoreOptions}
        position={moreMenuPosition}
        onClose={() => setShowMoreOptions(false)}
        onLearnMore={handleLearnMore}
        onBookRecommendations={handleBookRecommendations}
        onTakeaways={handleTakeaways}
        onSubmitQuote={handleSubmitQuote}
      />
    </div>
  );
};

export default QuoteWidget;
