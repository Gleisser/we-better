import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LifeWheelProps, LifeCategory } from './types';
import { DEFAULT_LIFE_CATEGORIES, MAX_CATEGORY_VALUE, MIN_CATEGORY_VALUE } from './constants/categories';
import RadarChart from './components/RadarChart/RadarChart';
import styles from './LifeWheel.module.css';

/**
 * Life Wheel component for visualizing and managing different life areas
 * 
 * @param data - Life wheel data containing categories and values
 * @param isLoading - Loading state flag
 * @param error - Error object if any
 * @param onCategoryUpdate - Callback for when a category value is updated
 * @param onComplete - Callback for when all categories have been reviewed
 * @param className - Additional CSS class
 * @param readOnly - Whether the wheel is editable or just for display
 */
const LifeWheel = ({
  data,
  isLoading = false,
  error = null,
  onCategoryUpdate,
  onComplete,
  className = '',
  readOnly = false
}: LifeWheelProps) => {
  // Use provided data or default values
  const [categories, setCategories] = useState<LifeCategory[]>(
    data?.categories || DEFAULT_LIFE_CATEGORIES
  );
  
  // Selected category for focused editing
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handle category selection
  const handleCategorySelect = useCallback((category: LifeCategory) => {
    if (readOnly) return;
    setSelectedCategory(category.id);
  }, [readOnly]);
  
  // Handle value change
  const handleValueChange = useCallback((categoryId: string, newValue: number) => {
    if (readOnly) return;
    
    // Update local state
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, value: newValue } 
          : cat
      )
    );
    
    // Call the external handler if provided
    onCategoryUpdate?.(categoryId, newValue);
  }, [onCategoryUpdate, readOnly]);
  
  // Handle complete button click
  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={`${styles.lifeWheelContainer} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`${styles.lifeWheelContainer} ${className}`}>
        <div className={styles.errorState}>
          <h3>Something went wrong</h3>
          <p>{error.message || 'Failed to load life wheel data'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.fullScreenContainer}>
      {/* Background image */}
      <div className={styles.backgroundImage} />
      
      {/* Main content container */}
      <div className={styles.contentWrapper}>
        <div className={styles.glassCard}>
          <h1 className={styles.title}>Life Wheel Assessment</h1>
          
          <div className={styles.radarContainer}>
            <RadarChart 
              data={categories.map(category => ({
                name: category.name,
                value: category.value,
                color: category.color,
                id: category.id
              }))}
              animate={true}
              onCategoryClick={handleCategorySelect}
            />
          </div>

          <div className={styles.categoriesList}>
            {categories.map((category, index) => (
              <div key={category.id} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <div 
                    className={styles.categoryColor}
                    style={{ background: category.color }}
                  />
                  <h3 className={styles.categoryName}>{category.name}</h3>
                </div>
                <input
                  type="range"
                  min={MIN_CATEGORY_VALUE}
                  max={MAX_CATEGORY_VALUE}
                  value={category.value}
                  onChange={(e) => handleValueChange(category.id, parseInt(e.target.value))}
                  className={styles.slider}
                  style={{ '--track-color': category.color } as any}
                />
                <div className={styles.valueLabel}>{category.value}/{MAX_CATEGORY_VALUE}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeWheel; 