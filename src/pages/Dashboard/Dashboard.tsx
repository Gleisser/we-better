import StoriesBar from '@/components/layout/StoriesBar/StoriesBar';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <StoriesBar />
      <div className={styles.content}>
        {/* Other dashboard widgets */}
      </div>
    </div>
  );
};

export default Dashboard; 