import React from 'react';
import { useCommonTranslation } from '@/shared/hooks/useTranslation';
import styles from '../../DreamBoardPage.module.css';
import { WeatherState, CategoryWeatherStatus } from '../../api/dreamWeatherApi';

interface Weather {
  message: string;
  overall: WeatherState;
  categoryStatus?: CategoryWeatherStatus;
}

interface DreamWeatherProps {
  weather: Weather;
}

const weatherImages = {
  sunny: '/assets/images/dreamboard/weather/sunny.webp',
  cloudy: '/assets/images/dreamboard/weather/cloudy.webp',
  stormy: '/assets/images/dreamboard/weather/stormy_rain.webp',
  raining: '/assets/images/dreamboard/weather/raining.webp',
};

// Weather display names are now handled via translations

const DreamWeather: React.FC<DreamWeatherProps> = ({ weather }) => {
  const { t } = useCommonTranslation();

  // Get the image path based on weather type - default to cloudy if not found
  const getWeatherImage = (type: string): string => {
    const normalizedType = type.toLowerCase().replace('-', '_');
    if (normalizedType in weatherImages) {
      return weatherImages[normalizedType as keyof typeof weatherImages];
    }
    return weatherImages.cloudy;
  };

  // Get display name for the weather status
  const getWeatherDisplayName = (type: string): string => {
    const weatherKey = `dreamBoard.weather.states.${type}` as const;
    return (t(weatherKey) as string) || (t('dreamBoard.weather.states.unknown') as string);
  };

  // Weather image source
  const imagePath = getWeatherImage(weather.overall);
  const weatherDisplayName = getWeatherDisplayName(weather.overall);

  return (
    <div className={styles.dreamWeatherCard}>
      <div className={styles.weatherGlassmorphism}>
        <div className={styles.weatherCardHeader}>
          <div className={styles.weatherTitle}>{t('dreamBoard.weather.title')}</div>
          <div className={styles.weatherCondition}>
            <span className={styles.weatherText}>{weatherDisplayName}</span>
          </div>
        </div>

        <div className={styles.weatherCardContent}>
          <p className={styles.weatherMessage}>{weather.message}</p>
        </div>

        <div className={styles.weatherImageContainer}>
          <img
            src={imagePath}
            alt={t('dreamBoard.weather.altText', { weather: weatherDisplayName }) as string}
            className={styles.weatherImageLarge}
          />
        </div>
      </div>
    </div>
  );
};

export default DreamWeather;
