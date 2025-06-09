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

interface FooterToolsProps {
  weather: Weather;
  notifications: Notification[];
}

const FooterTools: React.FC<FooterToolsProps> = ({ weather }) => {
  return (
    <footer className={styles.toolsFooter}>
      <DreamWeather weather={weather} />
    </footer>
  );
};

export default FooterTools;
