import React from 'react';
import styles from '../../DreamBoardPage.module.css';

interface Weather {
  message: string;
  overall: 'sunny' | 'partly-cloudy' | 'cloudy' | 'stormy';
  categoryStatus?: Record<string, 'sunny' | 'partly-cloudy' | 'cloudy' | 'stormy'>;
}

interface DreamWeatherProps {
  weather: Weather;
}

const weatherImages = {
  sunny: '/assets/images/dreamboard/weather/sunny.webp',
  'partly-cloudy': '/assets/images/dreamboard/weather/partially_cloudy.webp',
  cloudy: '/assets/images/dreamboard/weather/cloudy.webp',
  stormy: '/assets/images/dreamboard/weather/stormy_rain.webp',
  raining: '/assets/images/dreamboard/weather/raining.webp',
};

// Weather display names for better UI presentation
const weatherDisplayNames = {
  sunny: 'Sunny',
  'partly-cloudy': 'Partly Cloudy',
  cloudy: 'Cloudy',
  stormy: 'Stormy',
};

const DreamWeather: React.FC<DreamWeatherProps> = ({ weather }) => {
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
    return weatherDisplayNames[type as keyof typeof weatherDisplayNames] || 'Unknown';
  };

  // Weather image source
  const imagePath = getWeatherImage(weather.overall);
  const weatherDisplayName = getWeatherDisplayName(weather.overall);

  return (
    <div className={styles.dreamWeatherCard}>
      <div className={styles.weatherGlassmorphism}>
        <div className={styles.weatherCardHeader}>
          <div className={styles.weatherTemp}>
            <span className={styles.weatherIcon}>
              <img
                src={imagePath}
                alt={`${weatherDisplayName} weather`}
                className={styles.weatherIconImage}
              />
            </span>
            <h3 className={styles.weatherTitle}>Dream Weather</h3>
          </div>
          <div className={styles.weatherCondition}>
            <span className={styles.weatherText}>{weatherDisplayName}</span>
          </div>
        </div>

        <div className={styles.weatherCardContent}>
          <p className={styles.weatherMessage}>{weather.message}</p>
        </div>

        {weather.categoryStatus && Object.keys(weather.categoryStatus).length > 0 && (
          <div className={styles.weatherCategoryStatus}>
            <div className={styles.weatherCategoryStatsHeader}>Category Status</div>
            <div className={styles.weatherCategoryStatsGrid}>
              {Object.entries(weather.categoryStatus)
                .slice(0, 4)
                .map(([category, status]) => (
                  <div key={category} className={styles.weatherCategoryStat}>
                    <span className={styles.weatherCategoryName}>{category}</span>
                    <span
                      className={`${styles.weatherCategoryValue} ${styles[`weather${status.replace('-', '')}`]}`}
                    >
                      {getWeatherDisplayName(status)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamWeather;
