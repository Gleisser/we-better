import QuoteWidget from '@/shared/components/widgets/QuoteWidget/QuoteWidget';
//import { AffirmationWidget } from '@/shared/components/widgets/AffirmationWidget';
import HabitsWidget from '@/shared/components/widgets/HabitsWidget/HabitsWidget';
import GoalsWidget from '@/shared/components/widgets/GoalsWidget/GoalsWidget';
//import CutoutWidget from '@/shared/components/widgets/CutoutWidget/CutoutWidget';
import CardsWidget from '@/shared/components/widgets/CardsWidget/CardsWidget';
import { Article } from '@/core/services/articleService';
import styles from './DashboardGrid.module.css';
import LifeWheelWidget from '../../widgets/LifeWheelWidget/LifeWheelWidget';
import RadialLifeChartWidget from '../../widgets/RadialLifeChartWidget/RadialLifeChartWidget';
import MoodWidget from '../../widgets/MoodWidget/MoodWidget';

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

        {/* Affirmation Widget 
        <div className={`${styles.widget} ${styles.affirmation}`}>
          <AffirmationWidget />
        </div>
        */}

        {/* Cards Widget */}
        <div className={`${styles.widget} ${styles.cards}`}>
          <CardsWidget />
        </div>

        {/* Life Wheel Widget - Now in the position previously occupied by the article */}
        <div className={`${styles.widget} ${styles.lifeWheel}`}>
          <LifeWheelWidget />
        </div>

        {/* Mood Widget */}
        <div className={`${styles.widget} ${styles.mood}`}>
          <MoodWidget />
        </div>

        {/* Habits Widget */}
        <div className={`${styles.widget} ${styles.habits}`}>
          <HabitsWidget />
        </div>

        {/* Goals Widget */}
        <div className={`${styles.widget} ${styles.goals}`}>
          <GoalsWidget />
        </div>

        {/* Radial Life Chart Widget */}
        <div className={`${styles.widget} ${styles.radial}`}>
          <RadialLifeChartWidget />
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
