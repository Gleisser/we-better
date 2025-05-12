import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import DreamWeather from '../DreamWeather';
import DreamChallenge from '../DreamChallenge';
import { Dream } from '../../types';

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
  description: string;
  dreamId: string | null;
  duration: number;
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays: number[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  enableReminders: boolean;
  reminderTime: string | null;
  startDate: string;
  currentDay: number;
  completed: boolean;
}

interface FooterToolsProps {
  weather: Weather;
  notifications: Notification[];
  challenges: Challenge[];
  dreams?: Dream[];
  onOpenChallengeModal?: () => void;
}

const FooterTools: React.FC<FooterToolsProps> = ({
  weather,
  challenges,
  dreams = [],
  onOpenChallengeModal = () => {},
}) => {
  return (
    <footer className={styles.toolsFooter}>
      <DreamWeather weather={weather} />
      <DreamChallenge
        challenges={challenges}
        dreams={dreams}
        onOpenChallengeModal={onOpenChallengeModal}
      />
    </footer>
  );
};

export default FooterTools;
