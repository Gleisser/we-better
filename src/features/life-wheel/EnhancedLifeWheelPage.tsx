import { useState, useEffect } from 'react';
import EnhancedLifeWheel from './EnhancedLifeWheel';
import styles from './LifeWheel.module.css';
import { getLatestLifeWheelData } from './api/lifeWheelApi';
import { useTranslation } from 'react-i18next';

const EnhancedLifeWheelPage = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('common');

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
    <>
      <h1 className={`text-3xl font-bold mb-6 text-center ${styles.enhancedPageTitle}`}>
        {t('widgets.lifeWheel.assessment')}
      </h1>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>{t('widgets.lifeWheel.loading')}</p>
        </div>
      ) : (
        <EnhancedLifeWheel />
      )}
    </>
  );
};

export default EnhancedLifeWheelPage;
