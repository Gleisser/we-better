import { useState, useEffect } from 'react';

interface StreakData {
  count: number;
  lastAffirmed: string;
}

interface UseAffirmationStreakResult {
  streak: number;
  isNewMilestone: boolean;
  incrementStreak: () => boolean;
  resetMilestone: () => void;
}

export const useAffirmationStreak = (): UseAffirmationStreakResult => {
  const [streak, setStreak] = useState<number>(0);
  const [isNewMilestone, setIsNewMilestone] = useState(false);

  useEffect(() => {
    const storedStreak = localStorage.getItem('affirmationStreak');
    if (storedStreak) {
      const data: StreakData = JSON.parse(storedStreak);
      const lastAffirmed = new Date(data.lastAffirmed);
      const today = new Date();

      // Check if streak is still valid (within 24 hours)
      if (isWithin24Hours(lastAffirmed, today)) {
        setStreak(data.count);
      } else if (isConsecutiveDay(lastAffirmed, today)) {
        // If it's the next day, maintain streak
        setStreak(data.count);
      } else {
        // Reset streak if more than a day has passed
        setStreak(0);
      }
    }
  }, []);

  const incrementStreak = (): boolean => {
    const today = new Date();
    const storedStreak = localStorage.getItem('affirmationStreak');
    let newCount = 1;

    if (storedStreak) {
      const data: StreakData = JSON.parse(storedStreak);
      const lastAffirmed = new Date(data.lastAffirmed);

      if (isWithin24Hours(lastAffirmed, today)) {
        // Already affirmed today
        return false;
      } else if (isConsecutiveDay(lastAffirmed, today)) {
        // Next day, increment streak
        newCount = data.count + 1;
      }
    }

    // Check for milestone (every 5 days)
    if (newCount > 0 && newCount % 5 === 0) {
      setIsNewMilestone(true);
    }

    const newData: StreakData = {
      count: newCount,
      lastAffirmed: today.toISOString(),
    };

    localStorage.setItem('affirmationStreak', JSON.stringify(newData));
    setStreak(newCount);
    return true;
  };

  const resetMilestone = (): void => {
    setIsNewMilestone(false);
  };

  return {
    streak,
    isNewMilestone,
    incrementStreak,
    resetMilestone,
  };
};

// Helper functions
const isWithin24Hours = (date1: Date, date2: Date): boolean => {
  const hours = Math.abs(date2.getTime() - date1.getTime()) / 36e5;
  return hours < 24 && date1.getDate() === date2.getDate();
};

const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
  const dayDiff = Math.floor((date2.getTime() - date1.getTime()) / 8.64e7);
  return dayDiff === 1;
};
