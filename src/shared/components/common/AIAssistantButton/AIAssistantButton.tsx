import { motion } from 'framer-motion';
import { SparkleIcon } from '@/shared/components/common/icons';
import { useDashboardTranslation } from '@/shared/hooks/useTranslation';
import styles from './AIAssistantButton.module.css';

const AIAssistantButton = (): JSX.Element => {
  const { t } = useDashboardTranslation();

  return (
    <div className={styles.container}>
      <motion.button
        className={styles.button}
        type="button"
        disabled
        aria-label={`${t('floating.aiAssistant')}: ${t('floating.aiAssistantUnavailable')}`}
        title={t('floating.aiAssistantUnavailable')}
      >
        <div className={styles.content}>
          <SparkleIcon className={styles.icon} />
          <span className={styles.text}>{t('floating.aiAssistant')}</span>
          <span className={styles.status}>{t('floating.aiAssistantUnavailable')}</span>
        </div>
      </motion.button>
    </div>
  );
};

export default AIAssistantButton;
