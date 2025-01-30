import StoriesBar from '@/components/layout/StoriesBar/StoriesBar';
import DashboardGrid from '@/components/layout/DashboardGrid/DashboardGrid';
import AIAssistantButton from '@/components/common/AIAssistantButton/AIAssistantButton';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <DashboardGrid />
      <StoriesBar />
      <AIAssistantButton />
    </div>
  );
};

export default Dashboard; 