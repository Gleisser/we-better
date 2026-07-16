import React from 'react';
import styles from './FooterTools.module.css';
import DreamWeather from '../DreamWeather';
import { WeatherState, CategoryWeatherStatus } from '../../api/dreamWeatherApi';

interface Weather {
  message: string;
  overall: WeatherState;
  categoryStatus?: CategoryWeatherStatus;
}

interface FooterToolsProps {
  weather: Weather;
}

const FooterTools: React.FC<FooterToolsProps> = ({ weather }) => {
  return (
    <footer className={styles.toolsFooter}>
      <DreamWeather weather={weather} />
    </footer>
  );
};

export default FooterTools;
