import { useState } from 'react';
import { BookmarkIcon, ShareIcon, ArrowTopRight } from '@/components/common/icons';
import { useTimeBasedTheme } from '@/hooks/useTimeBasedTheme';
import { Article } from './types';
import { MOCK_ARTICLES } from './config';
import styles from './ArticleWidget.module.css';
import { Tooltip } from '@/components/common/Tooltip';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';

const ArticleWidget = () => {
  const [currentArticle] = useState<Article>(MOCK_ARTICLES[0]);
  const { theme } = useTimeBasedTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedArticles();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentArticle.title,
          text: currentArticle.description,
          url: currentArticle.url
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
          <span className={styles.headerIcon}>📰</span>
          <span className={styles.headerText}>Article of the Day</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.articleCard}>
          <div className={styles.thumbnailSection}>
            <img 
              src={currentArticle.thumbnail} 
              alt={currentArticle.title}
              className={styles.thumbnail}
            />
            <div className={styles.sourceBadge}>
              <img 
                src={currentArticle.source.icon} 
                alt={currentArticle.source.name}
                className={styles.sourceIcon}
              />
              {currentArticle.source.name}
            </div>
          </div>

          <div className={styles.articleInfo}>
            <h3 className={styles.articleTitle}>{currentArticle.title}</h3>
            
            <p className={styles.articleDescription}>{currentArticle.description}</p>

            <div className={styles.metadata}>
              <span className={styles.readTime}>⏱️ {currentArticle.readTime} min read</span>
              <span className={styles.publishDate}>
                {new Date(currentArticle.publishedAt).toLocaleDateString()}
              </span>
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.actionButtons}>
                <Tooltip content={isBookmarked(currentArticle.id) ? "Remove bookmark" : "Bookmark article"}>
                  <button
                    className={`${styles.iconButton} ${isBookmarked(currentArticle.id) ? styles.bookmarked : ''}`}
                    onClick={() => {
                      if (isBookmarked(currentArticle.id)) {
                        removeBookmark(currentArticle.id);
                      } else {
                        addBookmark(currentArticle);
                      }
                    }}
                  >
                    <BookmarkIcon 
                      className={styles.actionIcon} 
                      filled={isBookmarked(currentArticle.id)}
                    />
                  </button>
                </Tooltip>

                <Tooltip content="Share article">
                  <button
                    className={styles.iconButton}
                    onClick={handleShare}
                  >
                    <ShareIcon className={styles.actionIcon} />
                  </button>
                </Tooltip>
              </div>

              <a 
                href={currentArticle.url} 
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

export default ArticleWidget; 