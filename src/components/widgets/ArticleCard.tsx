import React, { useState } from 'react';
import styles from './ArticleCard.module.css';
import { CATEGORY_CONFIG } from './ArticleCard/config';
import { 
  BookmarkIcon, 
  ShareIcon, 
  ArrowTopRight,
  ChevronUpIcon,
  ChevronDownIcon
} from '@/components/common/icons';
import { Tooltip } from '@/components/common/Tooltip';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';

const ArticleCard = ({ article }) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedArticles();
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const category = CATEGORY_CONFIG[article.category] || {
    icon: '📚',
    label: 'General',
    color: 'rgba(255, 255, 255, 0.5)',
  };

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

  return (
    <div className={styles.card}>
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
                onClick={() => {
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

            <Tooltip content="Share article">
              <button
                className={`${styles.iconButton} ${styles.shareButton}`}
                onClick={handleShare}
              >
                <ShareIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
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
                    className={`${styles.voteButton} ${userVote === 'up' ? styles.votedUp : ''}`}
                    onClick={() => handleVote('up')}
                    aria-label="Upvote"
                  >
                    <ChevronUpIcon className={styles.voteIcon} />
                    <span className={styles.voteCount}>{votes > 0 ? votes : ''}</span>
                  </button>
                </Tooltip>
                
                <Tooltip content="Downvote">
                  <button
                    className={`${styles.voteButton} ${userVote === 'down' ? styles.votedDown : ''}`}
                    onClick={() => handleVote('down')}
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
  );
};

export default ArticleCard; 