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
  FlagIcon
} from '@/components/common/icons';
import { Tooltip } from '@/components/common/Tooltip';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';
import ArticlePopup from './ArticlePopup';

interface ArticleCardProps {
  article: {
    title: string;
    image: string;
    tldr: string;
    tags?: string[];
    id?: string;
    description?: string;
    url?: string;
    thumbnail?: string;
    readTime?: number;
    publishedAt?: string;
    category?: {
      slug: string;
    };
  };
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedArticles();
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const category = CATEGORY_CONFIG[formatSlug(article.category)] || {
    icon: '📚',
    label: 'General',
    color: 'rgba(255, 255, 255, 0.5)',
  };

  function formatSlug(slug: string | undefined) {
    if (slug) {
      if(slug === '12-minute-meditation') {
        return 'meditation';
      }
      //replace trace with underscore
      return slug.replace(/-/g, '_');
    }
    return 'general';
  }

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      // Remove vote
      setVotes(prev => voteType === 'up' ? prev - 1 : prev + 1);
      setUserVote(null);
    } else {
      // Change vote
      if (userVote) {
        // If already voted, remove previous vote
        setVotes(prev => userVote === 'up' ? prev - 2 : prev + 2);
      }
      // Add new vote
      setVotes(prev => voteType === 'up' ? prev + 1 : prev - 1);
      setUserVote(voteType);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleOptionClick = (action: string) => {
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
        // Handle not interested
        break;
    }
    setShowMoreMenu(false);
  };

  return (
    <>
      <div 
        className={styles.card}
        onClick={() => setIsPopupOpen(true)}
      >
        <div className={styles.innerCard}>
          <div className={styles.thumbnailSection}>
            <img 
              src={article.thumbnail} 
              alt={article.title} 
              className={styles.thumbnail}
            />
            
            {/* Category Badge */}
            <div 
              className={styles.categoryBadge}
              style={{ 
                '--category-color': category.color 
              } as React.CSSProperties}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryLabel}>{category.label}</span>
            </div>

            {/* Top Action Buttons */}
            <div className={styles.topActions}>
              <Tooltip content={isBookmarked(article.id) ? "Remove bookmark" : "Bookmark article"}>
                <button
                  className={`${styles.iconButton} ${styles.bookmarkButton} ${isBookmarked(article.id) ? styles.bookmarked : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isBookmarked(article.id)) {
                      removeBookmark(article.id);
                    } else {
                      addBookmark(article);
                    }
                  }}
                >
                  <BookmarkIcon 
                    className={styles.actionIcon} 
                    filled={isBookmarked(article.id)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('share');
                        }}
                      >
                        <ShareIcon className={styles.optionIcon} />
                        <span>Share via</span>
                      </button>

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('hide');
                        }}
                      >
                        <EyeOffIcon className={styles.optionIcon} />
                        <span>Hide</span>
                      </button>

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('follow');
                        }}
                      >
                        <BookmarkIcon className={styles.optionIcon} />
                        <span>Follow It's Foss</span>
                      </button>

                      <div className={styles.menuDivider} />

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('block');
                        }}
                      >
                        <EyeOffIcon className={styles.optionIcon} />
                        <span>Don't show posts from It's Foss</span>
                      </button>

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('notInterested');
                        }}
                      >
                        <HashtagIcon className={styles.optionIcon} />
                        <span>Not interested in #security</span>
                      </button>

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('notInterested');
                        }}
                      >
                        <HashtagIcon className={styles.optionIcon} />
                        <span>Not interested in #tools</span>
                      </button>

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('notInterested');
                        }}
                      >
                        <HashtagIcon className={styles.optionIcon} />
                        <span>Not interested in #linux</span>
                      </button>

                      <div className={styles.menuDivider} />

                      <button 
                        className={styles.moreOption}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick('report');
                        }}
                      >
                        <FlagIcon className={styles.optionIcon} />
                        <span>Report</span>
                      </button>
                    </div>
                    <div className={styles.menuOverlay} onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreMenu(false);
                    }} />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <h2 className={styles.title}>{article.title}</h2>
            <p className={styles.description}>{article.description}</p>

            <div className={styles.footer}>
              <div className={styles.metadata}>
                <span className={styles.readTime}>⏱️ {article.readTime} min read</span>
                <span className={styles.publishDate}>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className={styles.actions}>
                <div className={styles.voteContainer}>
                  <Tooltip content="Upvote">
                    <button
                      className={`${styles.voteButton} ${styles.upvoteButton} ${
                        userVote === 'up' ? styles.votedUp : ''
                      }`}
                      onClick={(e) => {
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
                      onClick={(e) => {
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
        article={article}
      />
    </>
  );
};

export default ArticleCard; 