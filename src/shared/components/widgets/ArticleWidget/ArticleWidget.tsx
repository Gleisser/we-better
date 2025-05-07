import { BookmarkIcon, ShareIcon, ArrowTopRight } from '@/shared/components/common/icons';
import { useTimeBasedTheme } from '@/shared/hooks/useTimeBasedTheme';
import styles from './ArticleWidget.module.css';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { useBookmarkedArticles } from '@/shared/hooks/useBookmarkedArticles';
import { Article } from '@/core/services/articleService';
import { formatRelativeDate } from '@/utils/helpers/dateUtils';

interface ArticleWidgetProps {
  article: Article | null;
  isLoading?: boolean;
}

const LoadingSkeleton = (): JSX.Element => (
  <div className={styles.skeletonContent}>
    <div className={styles.skeletonHeader}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonActions} />
    </div>

    <div className={styles.skeletonArticle}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonDetails}>
        <div className={styles.skeletonTags}>
          <div className={styles.skeletonTag} />
          <div className={styles.skeletonTag} style={{ width: '100px' }} />
        </div>
        <div className={styles.skeletonHeadline} />
        <div className={styles.skeletonDescription}>
          <div className={styles.skeletonLine} style={{ width: '100%' }} />
          <div className={styles.skeletonLine} style={{ width: '90%' }} />
          <div className={styles.skeletonLine} style={{ width: '95%' }} />
        </div>
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonAuthor} />
          <div className={styles.skeletonDate} />
        </div>
      </div>
    </div>
  </div>
);

const ArticleWidget: React.FC<ArticleWidgetProps> = ({ article, isLoading }) => {
  const { theme } = useTimeBasedTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkedArticles();

  const handleShare = async (): Promise<void> => {
    if (!article) return;

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

  if (isLoading || !article) {
    return (
      <div
        className={styles.container}
        style={
          {
            '--gradient-start': theme.gradientStart,
            '--gradient-middle': theme.gradientMiddle,
            '--gradient-end': theme.gradientEnd,
          } as React.CSSProperties
        }
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>📰</span>
            <span className={styles.headerText}>Article of the Day</span>
          </div>
        </div>
        <div className={styles.content}>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={
        {
          '--gradient-start': theme.gradientStart,
          '--gradient-middle': theme.gradientMiddle,
          '--gradient-end': theme.gradientEnd,
        } as React.CSSProperties
      }
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
            <img src={article.thumbnail} alt={article.title} className={styles.thumbnail} />
          </div>

          <div className={styles.articleInfo}>
            <h3 className={styles.articleTitle}>{article.title}</h3>
            <p className={styles.articleDescription}>{article.description}</p>

            <div className={styles.metadata}>
              <span className={styles.readTime}>⏱️ {article.readTime} min read</span>
              <span className={styles.publishDate}>{formatRelativeDate(article.publishedAt)}</span>
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.actionButtons}>
                <Tooltip
                  content={
                    isBookmarked(article.id.toString()) ? 'Remove bookmark' : 'Bookmark article'
                  }
                >
                  <button
                    className={`${styles.iconButton} ${isBookmarked(article.id.toString()) ? styles.bookmarked : ''}`}
                    onClick={() => {
                      if (isBookmarked(article.id.toString())) {
                        removeBookmark(article.id.toString());
                      } else {
                        addBookmark({
                          ...article,
                          id: article.id.toString(),
                          source: {
                            id: 'source_1',
                            name: 'Default Source',
                            icon: '',
                            url: article.url,
                          },
                          tags: article.tags ? article.tags.map(tag => tag.name) : [],
                        });
                      }
                    }}
                  >
                    <BookmarkIcon
                      className={styles.actionIcon}
                      filled={isBookmarked(article.id.toString())}
                    />
                  </button>
                </Tooltip>

                <Tooltip content="Share article">
                  <button className={styles.iconButton} onClick={handleShare}>
                    <ShareIcon className={styles.actionIcon} />
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

export default ArticleWidget;
