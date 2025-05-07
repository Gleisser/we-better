import { useState, useEffect, useRef } from 'react';
import styles from './LifeWheel.module.css';

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

interface LifeWheelProps {
  categories: LifeCategory[];
  onCategorySelect: (category: LifeCategory) => void;
  userName?: string;
}

// Debug function to log component updates
// const logDebug = (message: string, data?: unknown) : void => {
//   console.info(`[LifeWheel Debug] ${message}`, data || '');
// };

const LifeWheel = ({
  categories = [],
  onCategorySelect,
  userName = 'Gleisser Santos',
}: LifeWheelProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const rendersRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug mount/update/unmount
  useEffect(() => {
    //logDebug('LifeWheel mounted');
    return () => {
      //logDebug('LifeWheel unmounted');
    };
  }, []);

  useEffect(() => {
    rendersRef.current += 1;
    //logDebug(`Render count: ${rendersRef.current}`);
  });

  // // Toggle menu open/closed
  const toggleMenu = (): void => {
    //logDebug('Toggle menu', { currentState: isOpen, newState: !isOpen });
    setIsOpen(!isOpen);
  };

  // Get user initials for display
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Handle category click
  const handleCategoryClick = (category: LifeCategory): void => {
    //logDebug('Category clicked', { id: category.id });
    setActiveCategory(null);
    onCategorySelect(category);
  };

  // Handle showing tooltip
  const handleTooltipShow = (categoryId: string): void => {
    //if (!isOpen) return;
    //logDebug('Show tooltip', { categoryId });
    setActiveCategory(categoryId);
  };

  // Handle hiding tooltip
  const handleTooltipHide = (): void => {
    setActiveCategory(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} ref={containerRef}>
        {/* Center button */}
        <button className={styles.centerPiece} onClick={toggleMenu}>
          <div className={styles.scoreRing}>
            <div className={styles.initials}>{getInitials(userName)}</div>
          </div>
        </button>

        {/* Categories using CSS transitions instead of framer-motion */}
        <div className={styles.categoriesContainer}>
          {categories.map((category, index) => {
            // Calculate position on a circle
            const angle = (2 * Math.PI * index) / categories.length - Math.PI / 2;
            const radius = 90; // Distance from center

            const style = {
              // Use CSS custom properties for positioning
              '--category-x': `${Math.cos(angle) * radius}px`,
              '--category-y': `${Math.sin(angle) * radius}px`,
              '--category-delay': `${index * 50}ms`,
              '--category-bg': `linear-gradient(45deg, ${category.color.from}20, ${category.color.to}20)`,
              '--category-index': index,
            } as React.CSSProperties;

            return (
              <div
                key={category.id}
                className={`${styles.categoryBubble} ${isOpen ? styles.open : ''}`}
                style={style}
                onClick={() => handleCategoryClick(category)}
                onMouseEnter={() => handleTooltipShow(category.id)}
                onMouseLeave={handleTooltipHide}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>

                {/* Inline tooltip */}
                {isOpen && activeCategory === category.id && (
                  <div className={styles.tooltip}>
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={styles.categoryScore}>{category.score}</span>
                    {category.hasUpdate && <span className={styles.updateDot} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LifeWheel;
