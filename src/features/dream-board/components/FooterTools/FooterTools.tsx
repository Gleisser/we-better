import React from 'react';
import styles from '../../DreamBoardPage.module.css';

interface Weather {
  message: string;
  overall: string;
}

interface Notification {
  id: string;
  description: string;
  read: boolean;
}

interface Challenge {
  id: string;
  title: string;
  duration: number;
  currentDay: number;
  completed: boolean;
}

interface FooterToolsProps {
  weather: Weather;
  notifications: Notification[];
  challenges: Challenge[];
}

const FooterTools: React.FC<FooterToolsProps> = ({ weather, notifications, challenges }) => {
  return (
    <footer className={styles.toolsFooter}>
      <div className={styles.toolSection}>
        <h3>Dream Weather</h3>
        <p>{weather.message}</p>
        <div className={styles.weatherStatus}>
          Overall: <span className={styles.weatherIcon}>{weather.overall}</span>
        </div>
      </div>
      <div className={styles.toolSection}>
        <h3>Notifications</h3>
        <p>You have {notifications.filter(n => !n.read).length} unread notifications.</p>
        <div className={styles.notificationPreview}>{notifications[0].description}</div>
      </div>
      <div className={styles.toolSection}>
        <h3>Challenge Mode</h3>
        {challenges.filter(c => !c.completed).length > 0 ? (
          <p>
            {challenges.filter(c => !c.completed)[0].title}: Day{' '}
            {challenges.filter(c => !c.completed)[0].currentDay} of{' '}
            {challenges.filter(c => !c.completed)[0].duration}
          </p>
        ) : (
          <p>No active challenges. Start a new one!</p>
        )}
      </div>
    </footer>
  );
};

export default FooterTools;
