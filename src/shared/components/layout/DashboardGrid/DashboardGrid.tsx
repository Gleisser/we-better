import QuoteWidget from '@/shared/components/widgets/QuoteWidget/QuoteWidget';
import { AffirmationWidget } from '@/shared/components/widgets/AffirmationWidget';
import HabitsWidget from '@/shared/components/widgets/HabitsWidget/HabitsWidget';
import GoalsWidget from '@/shared/components/widgets/GoalsWidget/GoalsWidget';
import { Article } from '@/core/services/articleService';
import { PersonalAffirmation } from '@/core/services/affirmationsService';
import { Quote } from '@/core/services/quoteService';
import { HabitsResponse } from '@/core/services/habitsService';
import { GoalsResponse } from '@/core/services/goalsService';
// Assuming LifeWheelData structure based on lifeWheelApi.ts
// If LifeCategory is not globally available, define a minimal one here or import if possible
interface LifeCategory {
  id: string;
  name: string;
  value: number;
  color?: string;
  icon?: string;
  description?: string;
  details?: string;
  prompt?: string;
}
interface LifeWheelData {
  id: string;
  date: string;
  categories: LifeCategory[];
}

import styles from './DashboardGrid.module.css';
import LifeWheelWidget from '../../widgets/LifeWheelWidget/LifeWheelWidget';

interface DashboardGridProps {
  featuredArticle: Article | null;
  isLoading?: boolean;
  initialPersonalAffirmation?: PersonalAffirmation | null;
  initialLifeWheelData?: LifeWheelData | null; // Updated type
  initialQuotes?: Quote[] | null;
  rawInitialHabits?: HabitsResponse | null;
  initialGoals?: GoalsResponse | null;
}

const DashboardGrid: React.FC<DashboardGridProps> = (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.bentoGrid}>
        {/* Quote Widget */}
        <div className={`${styles.widget} ${styles.quote}`}>
          <QuoteWidget initialQuotes={props.initialQuotes} />
        </div>

        {/* Affirmation Widget */}
        <div className={`${styles.widget} ${styles.affirmation}`}>
          <AffirmationWidget initialPersonalAffirmation={props.initialPersonalAffirmation} />
        </div>

        {/* Life Wheel Widget - Now in the position previously occupied by the article */}
        <div className={`${styles.widget} ${styles.lifeWheel}`}>
          <LifeWheelWidget initialData={props.initialLifeWheelData} />
        </div>

        {/* Habits Widget */}
        <div className={`${styles.widget} ${styles.habits}`}>
          <HabitsWidget initialHabits={props.rawInitialHabits} />
        </div>

        {/* Goals Widget */}
        <div className={`${styles.widget} ${styles.goals}`}>
          <GoalsWidget initialGoals={props.initialGoals} />
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
