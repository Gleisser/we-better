import { useState, useEffect } from 'react';
import EnhancedLifeWheel from './EnhancedLifeWheel';
import styles from './LifeWheel.module.css';
import { getLatestLifeWheelData } from './api/lifeWheelApi';

const EnhancedLifeWheelPage = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className={styles.lifeWheelPageContainer}>
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Life Wheel Assessment</h1>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your life wheel data...</p>
        </div>
      ) : (
        <EnhancedLifeWheel />
      )}
    </div>
  );
};

export default EnhancedLifeWheelPage;
