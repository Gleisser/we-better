import QuoteWidget from '@/components/widgets/QuoteWidget/QuoteWidget';
import { AffirmationWidget } from '@/components/widgets/AffirmationWidget';
import HabitsWidget from '@/components/widgets/HabitsWidget/HabitsWidget';
import GoalsWidget from '@/components/widgets/GoalsWidget/GoalsWidget';
import styles from './DashboardGrid.module.css';

const DashboardGrid = () => {
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

        {/* Videos Widget */}
        <div className={`${styles.widget} ${styles.videos}`}>
          <div className={styles.placeholder}>
            <h3 className={styles.widgetTitle}>Recommended Videos</h3>
            <p className={styles.comingSoon}>Widget coming soon...</p>
          </div>
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
          <div className={styles.placeholder}>
            <h3 className={styles.widgetTitle}>Podcast of the Day</h3>
            <p className={styles.comingSoon}>Widget coming soon...</p>
          </div>
        </div>

        {/* Article Widget */}
        <div className={`${styles.widget} ${styles.article}`}>
          <div className={styles.placeholder}>
            <h3 className={styles.widgetTitle}>Article of the Day</h3>
            <p className={styles.comingSoon}>Widget coming soon...</p>
          </div>
        </div>

        {/* Course Widget */}
        <div className={`${styles.widget} ${styles.course}`}>
          <div className={styles.placeholder}>
            <h3 className={styles.widgetTitle}>Recommended Course</h3>
            <p className={styles.comingSoon}>Widget coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid; 