import QuoteWidget from '@/shared/components/widgets/QuoteWidget/QuoteWidget';
import { AffirmationWidget } from '@/shared/components/widgets/AffirmationWidget';
import HabitsWidget from '@/shared/components/widgets/HabitsWidget/HabitsWidget';
import GoalsWidget from '@/shared/components/widgets/GoalsWidget/GoalsWidget';
import PodcastWidget from '@/shared/components/widgets/PodcastWidget/PodcastWidget';
import VideoWidget from '@/shared/components/widgets/VideoWidget/VideoWidget';
import CourseWidget from '@/shared/components/widgets/CourseWidget/CourseWidget';
import BookWidget from '@/shared/components/widgets/BookWidget/BookWidget';
import ArticleWidget from '@/shared/components/widgets/ArticleWidget/ArticleWidget';
import { Article } from '@/core/services/articleService';
import styles from './DashboardGrid.module.css';

interface DashboardGridProps {
  featuredArticle: Article | null;
  isLoading?: boolean;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ featuredArticle, isLoading }) => {
  return (
    <div className={styles.container}>
      <div className={styles.bentoGrid}>
        {/* Quote Widget */}
        <div className={`${styles.widget} ${styles.quote}`}>
          <QuoteWidget />
        </div>

        {/* Affirmation Widget */}
        <div className={`${styles.widget} ${styles.affirmation}`}>
          <AffirmationWidget />
        </div>

        {/* Article Widget */}
        <div className={`${styles.widget} ${styles.article}`}>
          <ArticleWidget article={featuredArticle} isLoading={isLoading} />
        </div>

        {/* Habits Widget */}
        <div className={`${styles.widget} ${styles.habits}`}>
          <HabitsWidget />
        </div>

        {/* Goals Widget */}
        <div className={`${styles.widget} ${styles.goals}`}>
          <GoalsWidget />
        </div>

        {/* Podcast Widget */}
        <div className={`${styles.widget} ${styles.podcast}`}>
          <PodcastWidget />
        </div>

        {/* Videos Widget */}
        <div className={`${styles.widget} ${styles.videos}`}>
          <VideoWidget />
        </div>

        {/* Course Widget */}
        <div className={`${styles.widget} ${styles.course}`}>
          <CourseWidget />
        </div>

        {/* Book Widget */}
        <div className={`${styles.widget} ${styles.book}`}>
          <BookWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid; 