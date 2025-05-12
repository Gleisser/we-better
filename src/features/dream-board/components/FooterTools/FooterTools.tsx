import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import DreamWeather from '../DreamWeather';

interface Weather {
  message: string;
  overall: 'sunny' | 'partly-cloudy' | 'cloudy' | 'stormy';
  categoryStatus?: Record<string, 'sunny' | 'partly-cloudy' | 'cloudy' | 'stormy'>;
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
      <DreamWeather weather={weather} />

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
