import React, { useState } from 'react';
import styles from './ArticleCard.module.css';
import { CATEGORY_CONFIG } from './ArticleCard/config';
import {
  BookmarkIcon,
  ShareIcon,
  ArrowTopRight,
  ChevronUpIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  EyeOffIcon,
  HashtagIcon,
  FlagIcon,
  ClockIcon,
  CalendarIcon,
} from '@/shared/components/common/icons';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { useBookmarkedArticles } from '@/shared/hooks/useBookmarkedArticles';
import ArticlePopup from './ArticlePopup';
import { formatRelativeDate } from '@/utils/helpers/dateUtils';

interface ArticleCardProps {
  article: {
    title: string;
    image: string;
    tldr: string;
    tags?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    id?: string;
    description?: string;
    url?: string;
    thumbnail?: string;
    readTime?: number;
    postDate: string;
    publishedAt?: string;
    category?: string;
    tableOfContents?: Array<{
      id: string;
      title: string;
      level: number;
    }>;
  };
  onTagClick?: (tag: { id: number; name: string }) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onTagClick }) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedArticles();
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const categoryKey = formatSlug(article.category as string);
  const category = Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, categoryKey)
    ? CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG]
    : {
        icon: '📚',
        label: 'General',
        color: 'rgba(255, 255, 255, 0.5)',
      };

  function formatSlug(slug: string | undefined): string {
    if (slug) {
      if (slug === '12-minute-meditation') {
        return 'meditation';
      }
      //replace trace with underscore
      return slug.replace(/-/g, '_');
    }
    return 'general';
  }

  const handleVote = (voteType: 'up' | 'down'): void => {
    if (userVote === voteType) {
      // Remove vote
      setVotes(prev => (voteType === 'up' ? prev - 1 : prev + 1));
      setUserVote(null);
    } else {
      // Change vote
      if (userVote) {
        // If already voted, remove previous vote
        setVotes(prev => (userVote === 'up' ? prev - 2 : prev + 2));
      }
      // Add new vote
      setVotes(prev => (voteType === 'up' ? prev + 1 : prev - 1));
      setUserVote(voteType);
    }
  };

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleMoreClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const renderNotInterestedOptions = (): JSX.Element[] | null => {
    if (!article.tags || article.tags.length === 0) return null;

    return article.tags.slice(0, 3).map(tag => (
      <button
        key={tag.id}
        className={styles.moreOption}
        onClick={e => {
          e.stopPropagation();
          handleOptionClick('notInterested', tag);
        }}
      >
        <HashtagIcon className={styles.optionIcon} />
        <span>Not interested in #{tag.name}</span>
      </button>
    ));
  };

  const handleOptionClick = (action: string, tag?: { id: number; name: string }): void => {
    switch (action) {
      case 'share':
        handleShare();
        break;
      case 'hide':
        // Handle hide
        break;
      case 'follow':
        // Handle follow
        break;
      case 'block':
        // Handle block
        break;
      case 'notInterested':
        if (tag) {
          // Handle not interested in specific tag
          console.info(`Not interested in tag: ${tag.name}`);
        }
        break;
      case 'report':
        // Handle report
        break;
    }
    setShowMoreMenu(false);
  };

  // const handleTagClick = (tag: { id: number; name: string }) => {
  //   if (onTagClick) {
  //     onTagClick(tag);
  //   }
  // };

  return (
    <>
      <div className={styles.card} onClick={() => setIsPopupOpen(true)}>
        <div className={styles.innerCard}>
          <div className={styles.thumbnailSection}>
            <img src={article.thumbnail} alt={article.title} className={styles.thumbnail} />

            {/* Category Badge */}
            <div
              className={styles.categoryBadge}
              style={
                {
                  '--category-color': category.color,
                } as React.CSSProperties
              }
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryLabel}>{category.label}</span>
            </div>

            {/* Top Action Buttons */}
            <div className={styles.topActions}>
              <Tooltip
                content={
                  article.id && isBookmarked(article.id) ? 'Remove bookmark' : 'Bookmark article'
                }
              >
                <button
                  className={`${styles.iconButton} ${styles.bookmarkButton} ${article.id && isBookmarked(article.id) ? styles.bookmarked : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    if (article.id) {
                      if (isBookmarked(article.id)) {
                        removeBookmark(article.id);
                      } else {
                        addBookmark({
                          ...article,
                          id: article.id,
                          description: article.description || article.tldr || '',
                          url: article.url || '',
                          thumbnail: article.thumbnail || article.image || '',
                          source: {
                            id: 'default',
                            name: 'Default Source',
                            icon: '',
                            url: article.url || '',
                          },
                          tags: article.tags ? article.tags.map(tag => tag.name) : [],
                          readTime: article.readTime || 0,
                          publishedAt: article.publishedAt || new Date().toISOString(),
                        });
                      }
                    }
                  }}
                >
                  <BookmarkIcon
                    className={styles.actionIcon}
                    filled={article.id ? isBookmarked(article.id) : false}
                  />
                </button>
              </Tooltip>

              <div className={styles.moreWrapper}>
                <Tooltip content="More options">
                  <button
                    className={`${styles.iconButton} ${styles.moreButton} ${showMoreMenu ? styles.active : ''}`}
                    onClick={handleMoreClick}
                  >
                    <MoreVerticalIcon className={styles.actionIcon} />
                  </button>
                </Tooltip>

                {showMoreMenu && (
                  <>
                    <div className={styles.moreMenu}>
                      <button
                        className={styles.moreOption}
                        onClick={e => {
                          e.stopPropagation();
                          handleOptionClick('share');
                        }}
                      >
                        <ShareIcon className={styles.optionIcon} />
                        <span>Share via</span>
                      </button>

                      <button
                        className={styles.moreOption}
                        onClick={e => {
                          e.stopPropagation();
                          handleOptionClick('hide');
                        }}
                      >
                        <EyeOffIcon className={styles.optionIcon} />
                        <span>Hide</span>
                      </button>

                      <div className={styles.menuDivider} />
                      {/* Dynamic Not Interested Options */}
                      {renderNotInterestedOptions()}

                      <div className={styles.menuDivider} />

                      <button
                        className={styles.moreOption}
                        onClick={e => {
                          e.stopPropagation();
                          handleOptionClick('report');
                        }}
                      >
                        <FlagIcon className={styles.optionIcon} />
                        <span>Report</span>
                      </button>
                    </div>
                    <div
                      className={styles.menuOverlay}
                      onClick={e => {
                        e.stopPropagation();
                        setShowMoreMenu(false);
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <h2 className={styles.title}>{article.title}</h2>
            <div className={styles.description}>{article.description}</div>

            <div className={styles.footer}>
              <div className={styles.metadata}>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {article.readTime && (
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {article.readTime} min read
                    </span>
                  )}
                  {article.postDate && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {formatRelativeDate(article.postDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <div className={styles.voteContainer}>
                  <Tooltip content="Upvote">
                    <button
                      className={`${styles.voteButton} ${styles.upvoteButton} ${
                        userVote === 'up' ? styles.votedUp : ''
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        handleVote('up');
                      }}
                      aria-label="Upvote"
                    >
                      <ChevronUpIcon className={styles.voteIcon} />
                      <span className={styles.voteCount}>{votes > 0 ? votes : ''}</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Downvote">
                    <button
                      className={`${styles.voteButton} ${styles.downvoteButton} ${
                        userVote === 'down' ? styles.votedDown : ''
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        handleVote('down');
                      }}
                      aria-label="Downvote"
                    >
                      <ChevronDownIcon className={styles.voteIcon} />
                    </button>
                  </Tooltip>
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.readButton}
                >
                  <span>Read Article</span>
                  <ArrowTopRight className={styles.readIcon} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArticlePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onTagClick={onTagClick}
        article={{
          ...article,
          id: article.id || `article-${Date.now()}`,
          url: article.url || '#',
          postDate: article.postDate || article.publishedAt || new Date().toISOString(),
          category:
            typeof article.category === 'string'
              ? {
                  id: 1,
                  name: article.category,
                  slug: formatSlug(article.category),
                }
              : undefined,
        }}
      />
    </>
  );
};

export default ArticleCard;
