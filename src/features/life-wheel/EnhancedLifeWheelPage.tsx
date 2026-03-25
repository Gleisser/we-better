import EnhancedLifeWheel from './EnhancedLifeWheel';
import styles from './EnhancedLifeWheel.module.css';
import { useLifeWheelTranslation } from '@/shared/hooks/useTranslation';

const EnhancedLifeWheelPage = (): JSX.Element => {
  const { t } = useLifeWheelTranslation();

  return (
    <>
      <h1 className={`text-3xl font-bold mb-6 text-center ${styles.enhancedPageTitle}`}>
        {t('widgets.lifeWheel.assessment')}
      </h1>
      <EnhancedLifeWheel />
    </>
  );
};

export default EnhancedLifeWheelPage;
