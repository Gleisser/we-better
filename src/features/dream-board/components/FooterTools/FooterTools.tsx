import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import DreamWeather from '../DreamWeather';
import { WeatherState, CategoryWeatherStatus } from '../../api/dreamWeatherApi';

interface Weather {
  message: string;
  overall: WeatherState;
  categoryStatus?: CategoryWeatherStatus;
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
