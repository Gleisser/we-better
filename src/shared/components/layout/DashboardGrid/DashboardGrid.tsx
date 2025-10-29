import QuoteWidget from '@/shared/components/widgets/QuoteWidget/QuoteWidget';
import { AffirmationWidget } from '@/shared/components/widgets/AffirmationWidget';
import HabitsWidget from '@/shared/components/widgets/HabitsWidget/HabitsWidget';
import GoalsWidget from '@/shared/components/widgets/GoalsWidget/GoalsWidget';
//import CutoutWidget from '@/shared/components/widgets/CutoutWidget/CutoutWidget';
import CardsWidget from '@/shared/components/widgets/CardsWidget/CardsWidget';
import { Article } from '@/core/services/articleService';
import styles from './DashboardGrid.module.css';
import LifeWheelWidget from '../../widgets/LifeWheelWidget/LifeWheelWidget';

interface DashboardGridProps {
  featuredArticle: Article | null;
  isLoading?: boolean;
}

const DashboardGrid: React.FC<DashboardGridProps> = () => {
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

        {/* Life Wheel Widget - Now in the position previously occupied by the article */}
        <div className={`${styles.widget} ${styles.lifeWheel}`}>
          <LifeWheelWidget />
        </div>

        {/* Habits Widget */}
        <div className={`${styles.widget} ${styles.habits}`}>
          <HabitsWidget />
        </div>

        {/* Goals Widget */}
        <div className={`${styles.widget} ${styles.goals}`}>
          <GoalsWidget />
        </div>

        {/* Cards Widget */}
        <div className={`${styles.widget} ${styles.cards}`}>
          <CardsWidget />
        </div>

        {/* Cutout Widget */}
        {/* <div className={`${styles.widget} ${styles.cutout}`}>
          <CutoutWidget />
        </div> */}
      </div>
    </div>
  );
};

export default DashboardGrid;
