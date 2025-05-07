import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LifeWheel from '@/shared/components/layout/LifeWheel/LifeWheel';
import { EnhancedRadarChart } from '@/features/life-wheel';
import { getLatestLifeWheelData } from '@/features/life-wheel/api/lifeWheelApi';
import styles from './Dashboard.module.css';

// Use the correct LifeCategory interface that matches the one in OrbitalStories
interface LifeCategory {
  id: string;
  name: string;
  color: {
    from: string;
    to: string;
  };
  icon: string;
  score: number;
  hasUpdate: boolean;
  orbitRadius?: number;
  orbitSpeed?: number;
}

// Interface for radar chart data point
interface RadarDataPoint {
  id: string;
  name: string;
  value: number;
  color: string | { from: string; to: string };
  description?: string;
  icon?: string;
}

const LifeWheelWidget = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showRadarView, setShowRadarView] = useState(false);
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await getLatestLifeWheelData();
        if (response.entry) {
          // Map the response data to the required format for the widget
          const mappedCategories = response.entry.categories.map(category => ({
            id: category.id,
            name: category.name,
            color:
              typeof category.color === 'string'
                ? { from: category.color, to: category.color }
                : category.color,
            icon: category.icon || '📊',
            score: category.value,
            hasUpdate: true,
            orbitRadius: Math.random() * 60 + 100, // Random orbit radius for visual variety
            orbitSpeed: Math.random() * 0.5 + 0.3, // Random orbit speed for visual variety
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Error loading life wheel data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = useCallback(
    (_category: LifeCategory) => {
      navigate('/app/life-wheel');
    },
    [navigate]
  );

  const handleToggleView = useCallback(() => {
    setShowRadarView(prev => !prev);
  }, []);

  const handleRadarCategoryClick = useCallback((category: RadarDataPoint) => {
    setTooltipContent(`${category.name}: ${category.value}/10`);
    setTimeout(() => setTooltipContent(null), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.lifeWheelWidget}>
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          <p>Loading life wheel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.lifeWheelWidget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>Life Balance</h3>
        <button
          onClick={handleToggleView}
          className={styles.viewToggleButton}
          title={showRadarView ? 'Switch to orbital view' : 'Switch to radar view'}
        >
          {showRadarView ? '⚪' : '📊'}
        </button>
      </div>

      {showRadarView ? (
        <div className={styles.radarViewContainer}>
          <EnhancedRadarChart
            data={categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              value: cat.score,
              color: cat.color,
              icon: cat.icon,
              description: `Your current score is ${cat.score}/10`,
            }))}
            animate={true}
            onCategoryClick={handleRadarCategoryClick}
            className={styles.dashboardRadarChart}
          />
          {tooltipContent && <div className={styles.radarTooltip}>{tooltipContent}</div>}
        </div>
      ) : (
        <LifeWheel categories={categories} onCategorySelect={handleCategorySelect} />
      )}

      <div className={styles.widgetFooter}>
        <button onClick={() => navigate('/app/life-wheel')} className={styles.seeMoreButton}>
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

export default LifeWheelWidget;
