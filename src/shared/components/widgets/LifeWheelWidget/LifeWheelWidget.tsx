import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LifeWheel from '@/shared/components/layout/LifeWheel/LifeWheel';
import { getLatestLifeWheelData } from '@/features/life-wheel/api/lifeWheelApi';
import { createLogger } from '@/shared/utils/debugUtils';
import styles from './LifeWheelWidget.module.css';

// Create a logger
const logger = createLogger('LifeWheelWidget');

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

// Simplified fixed tooltip component to minimize DOM changes
const FixedTooltip = ({ content }: { content: string | null }): JSX.Element | null => {
  if (!content) return null;

  return <div className={styles.wheelTooltip}>{content}</div>;
};

const LifeWheelWidget = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  // Track render cycles
  useEffect(() => {
    renderCountRef.current += 1;
    logger.log(`Widget render #${renderCountRef.current}`);
  });

  // Track component mount/unmount and performance
  useEffect(() => {
    const startTime = performance.now();
    logger.log('Widget mounted');

    return () => {
      logger.log('Widget unmounted', {
        lifetime: performance.now() - startTime,
      });
    };
  }, []);

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
          logger.log('Categories loaded', { count: mappedCategories.length });
        }
      } catch (error) {
        console.error('Error loading life wheel data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Optimized handler with requestAnimationFrame for better performance
  const handleCategorySelect = useCallback((category: LifeCategory) => {
    logger.log('Category selected', { id: category.id, name: category.name });

    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      // Clear existing timeout to prevent race conditions
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      // Update tooltip with minimal DOM changes
      setTooltipContent(`${category.name} score: ${category.score}`);

      // Auto-hide tooltip after 3 seconds, with RAF for perf
      tooltipTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          logger.log('Tooltip timeout completed');
          setTooltipContent(null);
        });
      }, 3000);
    });
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Track tooltip state changes for debugging
  useEffect(() => {
    logger.log('Tooltip content changed', { content: tooltipContent });
  }, [tooltipContent]);

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
    <div className={styles.lifeWheelWidget} ref={widgetRef}>
      <div className={styles.widgetHeader}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>⚖️</span>
            <span className={styles.headerText}>Life Balance</span>
          </div>
        </div>
      </div>
      <div className={styles.wheelViewContainer}>
        <LifeWheel categories={categories} onCategorySelect={handleCategorySelect} />

        {/* Fixed positioned tooltip to minimize layout changes */}
        <FixedTooltip content={tooltipContent} />
      </div>
      <div className={styles.widgetFooter}>
        <button onClick={() => navigate('/app/life-wheel')} className={styles.seeMoreButton}>
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

export default LifeWheelWidget;
