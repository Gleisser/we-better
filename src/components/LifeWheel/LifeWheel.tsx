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
    <motion.div 
      className={`${styles.lifeWheelContainer} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.headerSection}>
        <h2 className={styles.title}>Your Life Wheel</h2>
        <p className={styles.description}>
          Visualize and balance the different areas of your life
        </p>
      </div>
      
      <div className={styles.chartSection}>
        <RadarChart 
          data={categories} 
          animate={true}
          onCategoryClick={handleCategorySelect}
        />
      </div>
      
      <div className={styles.categoriesList}>
        {categories.map(category => (
          <motion.div
            key={category.id}
            className={styles.categoryCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => handleCategorySelect(category)}
            style={{
              borderLeft: `3px solid ${category.color}`,
              boxShadow: selectedCategory === category.id ? `0 0 0 1px ${category.color}` : 'none'
            }}
          >
            <div className={styles.categoryHeader}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </div>
            
            <p className={styles.categoryDesc}>{category.description}</p>
            
            <div className={styles.categoryValue}>
              {category.value} / {MAX_CATEGORY_VALUE}
            </div>
            
            {!readOnly && (
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min={MIN_CATEGORY_VALUE}
                  max={MAX_CATEGORY_VALUE}
                  value={category.value}
                  onChange={(e) => handleValueChange(category.id, parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: category.color
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {!readOnly && (
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={() => setCategories(DEFAULT_LIFE_CATEGORIES)}
          >
            Reset
          </button>
          
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={handleComplete}
          >
            Save
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default LifeWheel; 