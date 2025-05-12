import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import DreamWeather from '../DreamWeather';
import DreamChallenge from '../DreamChallenge';

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

const FooterTools: React.FC<FooterToolsProps> = ({ weather, challenges }) => {
  return (
    <footer className={styles.toolsFooter}>
      <DreamWeather weather={weather} />
      <DreamChallenge challenges={challenges} />
    </footer>
  );
};

export default FooterTools;
