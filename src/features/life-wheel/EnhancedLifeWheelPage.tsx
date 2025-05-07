import { useState, useEffect } from 'react';
import EnhancedLifeWheel from './EnhancedLifeWheel';
import styles from './LifeWheel.module.css';
import { ChevronDownIcon } from '@/shared/components/common/icons';
import { getLatestLifeWheelData } from './api/lifeWheelApi';

const EnhancedLifeWheelPage = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [selectedView, setSelectedView] = useState('Enhanced');

  const viewOptions = [
    { label: 'Enhanced', value: 'enhanced' },
    { label: 'Classic', value: 'classic' },
  ];

  useEffect(() => {
    // Initial data loading
    const fetchInitialData = async (): Promise<void> => {
      try {
        await getLatestLifeWheelData();
        // Data is loaded directly by the EnhancedLifeWheel component
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleViewSelect = (option: string): void => {
    setSelectedView(option);
    setShowViewOptions(false);
  };

  return (
    <div className={styles.lifeWheelPageContainer}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <div className={styles.dropdownContainer}>
            <button
              className={`${styles.filterButton} ${showViewOptions ? styles.active : ''}`}
              onClick={() => setShowViewOptions(!showViewOptions)}
            >
              <span>View: {selectedView}</span>
              <ChevronDownIcon
                className={`${styles.filterIcon} ${showViewOptions ? styles.rotated : ''}`}
              />
            </button>

            {showViewOptions && (
              <div className={styles.dropdownMenu}>
                {viewOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.dropdownItem} ${selectedView === option.label ? styles.selected : ''}`}
                    onClick={() => handleViewSelect(option.label)}
                  >
                    {option.label}
                    {selectedView === option.label && <span className={styles.checkmark}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.lifeWheelContent}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading your life wheel data...</p>
          </div>
        ) : (
          <EnhancedLifeWheel />
        )}
      </div>
    </div>
  );
};

export default EnhancedLifeWheelPage;
