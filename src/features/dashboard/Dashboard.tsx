import DashboardGrid from '@/shared/components/layout/DashboardGrid/DashboardGrid';
import AIAssistantButton from '@/shared/components/common/AIAssistantButton/AIAssistantButton';
import styles from './Dashboard.module.css';

const Dashboard = (): JSX.Element => {
  return (
    <div className={styles.container}>
      <DashboardGrid />
      <AIAssistantButton />
    </div>
  );
};

export default Dashboard;
