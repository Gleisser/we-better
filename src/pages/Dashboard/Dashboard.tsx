import StoriesBar from '@/components/layout/StoriesBar/StoriesBar';
import AIAssistantButton from '@/components/common/AIAssistantButton/AIAssistantButton';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <StoriesBar />
      <div className={styles.content}>
        {/* Other dashboard widgets */}
      </div>
      <AIAssistantButton />
    </div>
  );
};

export default Dashboard; 