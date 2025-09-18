import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LifeWheel from '@/shared/components/layout/LifeWheel/LifeWheel';
import { getLatestLifeWheelData } from '@/features/life-wheel/api/lifeWheelApi';
import { createLogger } from '@/shared/utils/debugUtils';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from './LifeWheelWidget.module.css';
import { Tooltip } from '@/shared/components/common/Tooltip';
import { useAuth } from '@/shared/hooks/useAuth';

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

// External Link Icon Component
const ExternalLinkIcon = ({ className }: { className?: string }): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LifeWheelWidget = (): JSX.Element => {
  const { t } = useCommonTranslation();
  const navigate = useNavigate();

  // Function to get translated category name
  const getTranslatedCategoryName = useCallback(
    (categoryName: string): string => {
      // Convert category name to lowercase and remove spaces for key matching
      const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '');
      // Map common category name variations to translation keys
      const categoryKeyMap: Record<string, string> = {
        health: 'health',
        career: 'career',
        money: 'money',
        family: 'family',
        relationship: 'relationship',
        relationships: 'relationship',
        social: 'social',
        spirituality: 'spirituality',
        spiritual: 'spirituality',
        selfcare: 'selfCare',
        'self-care': 'selfCare',
        personal: 'personal',
        education: 'education',
        recreation: 'recreation',
        environment: 'environment',
        community: 'community',
        finances: 'finances',
        personalgrowth: 'personalGrowth',
        'personal-growth': 'personalGrowth',
        'personal growth': 'personalGrowth',
        // Add more mappings as needed based on backend category names
      };

      const translationKey = categoryKeyMap[normalizedName];
      if (translationKey) {
        const translated = t(`widgets.lifeWheel.categories.${translationKey}`);
        return Array.isArray(translated) ? translated[0] : translated;
      }

      // Fallback to original name if no translation found
      return categoryName;
    },
    [t]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  // const renderCountRef = useRef(0); // Removed to prevent infinite loops

  // Handle navigation to LifeWheelPage
  const handleNavigateToLifeWheel = (): void => {
    navigate('/app/life-wheel');
  };

  // Store raw categories from backend
  const [rawCategories, setRawCategories] = useState<
    Array<{
      id: string;
      name: string;
      color: string | { from: string; to: string };
      icon?: string;
      value: number;
    }>
  >([]);

  // Fetch username on mount
  const { user } = useAuth();

  const username = useMemo(() => {
    if (user?.display_name?.trim()) {
      return user.display_name.trim();
    }
  }, [user]);

  // Fetch initial data (only once)
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await getLatestLifeWheelData();
        if (response.entry) {
          // Store raw categories without translation
          setRawCategories(response.entry.categories);
        }
      } catch (error) {
        console.error('Error loading life wheel data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // No dependencies - fetch only once

  // Translate categories directly in render (no useEffect to avoid infinite loops)
  const categories = useMemo(() => {
    if (rawCategories.length === 0) return [];

    return rawCategories.map(category => ({
      id: category.id,
      name: getTranslatedCategoryName(category.name), // Translate the category name
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
  }, [rawCategories, getTranslatedCategoryName]);

  // Optimized handler with requestAnimationFrame for better performance
  const handleCategorySelect = useCallback(
    (category: LifeCategory) => {
      logger.log('Category selected', { id: category.id, name: category.name });

      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        // Clear existing timeout to prevent race conditions
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }

        // Update tooltip with minimal DOM changes
        // Note: category.name is already translated when passed to LifeWheel component
        const categoryScoreText = t('widgets.lifeWheel.categoryScore');
        const scoreText = Array.isArray(categoryScoreText)
          ? categoryScoreText[0]
          : categoryScoreText;
        setTooltipContent(`${category.name} ${scoreText} ${category.score}`);

        // Auto-hide tooltip after 3 seconds, with RAF for perf
        tooltipTimeoutRef.current = setTimeout(() => {
          requestAnimationFrame(() => {
            logger.log('Tooltip timeout completed');
            setTooltipContent(null);
          });
        }, 3000);
      });
    },
    [t]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={styles.lifeWheelWidget}>
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          <p>{t('widgets.lifeWheel.loading')}</p>
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
            <span className={styles.headerText}>{t('widgets.lifeWheel.title')}</span>
          </div>
          <div className={styles.headerActions}>
            <Tooltip content={t('widgets.lifeWheel.goToDetails')}>
              <button
                className={styles.actionButton}
                onClick={handleNavigateToLifeWheel}
                aria-label={(() => {
                  const label = t('widgets.lifeWheel.goToDetails');
                  return Array.isArray(label) ? label[0] : label;
                })()}
              >
                <ExternalLinkIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className={styles.wheelViewContainer}>
        <LifeWheel
          categories={categories}
          onCategorySelect={handleCategorySelect}
          userName={username}
        />

        {/* Fixed positioned tooltip to minimize layout changes */}
        <FixedTooltip content={tooltipContent} />
      </div>
      <div className={styles.widgetFooter}>
        <button onClick={handleNavigateToLifeWheel} className={styles.seeMoreButton}>
          {t('widgets.lifeWheel.viewAnalysis')}
        </button>
      </div>
    </div>
  );
};

export default LifeWheelWidget;
