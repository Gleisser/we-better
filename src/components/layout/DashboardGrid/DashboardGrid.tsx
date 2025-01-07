import { motion } from 'framer-motion';
import QuoteWidget from '@/components/widgets/QuoteWidget/QuoteWidget';
import { AffirmationWidget } from '@/components/widgets/AffirmationWidget';
import HabitsWidget from '@/components/widgets/HabitsWidget/HabitsWidget';
import styles from './DashboardGrid.module.css';

type WidgetSize = 'small' | 'medium' | 'large' | 'vertical' | 'horizontal';

interface WidgetConfig {
  id: string;
  size: WidgetSize;
  title: string;
  gridArea?: string;
}

// Bento-style widget configuration
const WIDGETS: WidgetConfig[] = [
  { 
    id: 'quote', 
    size: 'medium', 
    title: 'Quote of the Day',
    gridArea: 'quote'
  },
  { 
    id: 'affirmation', 
    size: 'small', 
    title: 'Daily Affirmation',
    gridArea: 'affirmation'
  },
  { 
    id: 'habits', 
    size: 'large',
    title: 'Habits Tracking',
    gridArea: 'videos'
  },
  { 
    id: 'goals', 
    size: 'vertical', 
    title: 'Goals Tracking',
    gridArea: 'goals'
  },
  { 
    id: 'videos', 
    size: 'horizontal',
    title: 'Recommended Videos',
    gridArea: 'habits'
  },
  { 
    id: 'podcast', 
    size: 'medium', 
    title: 'Podcast of the Day',
    gridArea: 'podcast'
  },
  { 
    id: 'article', 
    size: 'small', 
    title: 'Article of the Day',
    gridArea: 'article'
  },
  { 
    id: 'course', 
    size: 'horizontal', 
    title: 'Recommended Course',
    gridArea: 'course'
  }
];

const DashboardGrid = () => {
  return (
    <div className={styles.container}>
      <div className={styles.bentoGrid}>
        {WIDGETS.map((widget) => (
          <motion.div
            key={widget.id}
            className={`${styles.widget} ${styles[widget.size]}`}
            style={{ 
              gridArea: widget.gridArea,
              position: 'relative'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {widget.id === 'quote' ? (
              <div style={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 1
              }}>
                <QuoteWidget />
              </div>
            ) : widget.id === 'affirmation' ? (
              <div style={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 1
              }}>
                <AffirmationWidget />
              </div>
            ) : widget.id === 'habits' ? (
              <div style={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 1
              }}>
                <HabitsWidget />
              </div>
            ) : (
              <div className={styles.placeholder}>
                <h3 className={styles.widgetTitle}>{widget.title}</h3>
                <p className={styles.comingSoon}>Widget coming soon...</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid; 