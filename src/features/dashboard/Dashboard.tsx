import { lazy, Suspense } from 'react';
import styles from './Dashboard.module.css';
import DashboardGrid from '@/shared/components/layout/DashboardGrid/DashboardGrid';
import { useIdleActivation } from '@/shared/hooks/utils/useIdleActivation';

const loadAIAssistantButton = (): Promise<
  typeof import('@/shared/components/common/AIAssistantButton/AIAssistantButton')
> => import('@/shared/components/common/AIAssistantButton/AIAssistantButton');

const AIAssistantButton = lazy(loadAIAssistantButton);

const Dashboard = (): JSX.Element => {
  const shouldRenderAIAssistant = useIdleActivation({
    timeout: 2500,
    fallbackDelay: 1500,
  });

  return (
    <div className={styles.container}>
      <DashboardGrid />
      {shouldRenderAIAssistant ? (
        <Suspense fallback={null}>
          <AIAssistantButton />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Dashboard;
