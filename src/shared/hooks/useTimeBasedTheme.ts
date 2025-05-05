import { useState, useEffect } from 'react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface ThemeColors {
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
  accentRGB: string;
}

const TIME_THEMES: Record<TimeOfDay, ThemeColors> = {
  morning: {
    gradientStart: 'rgba(30, 30, 40, 0.95)',
    gradientMiddle: 'rgba(40, 40, 60, 0.95)',
    gradientEnd: 'rgba(30, 30, 40, 0.95)',
    accentRGB: '255, 170, 100', // Warm morning glow
  },
  afternoon: {
    gradientStart: 'rgba(20, 20, 30, 0.95)',
    gradientMiddle: 'rgba(30, 30, 45, 0.95)',
    gradientEnd: 'rgba(20, 20, 30, 0.95)',
    accentRGB: '150, 200, 255', // Bright blue sky
  },
  evening: {
    gradientStart: 'rgba(25, 20, 35, 0.95)',
    gradientMiddle: 'rgba(35, 30, 50, 0.95)',
    gradientEnd: 'rgba(25, 20, 35, 0.95)',
    accentRGB: '255, 130, 150', // Sunset pink
  },
  night: {
    gradientStart: 'rgba(10, 10, 20, 0.95)',
    gradientMiddle: 'rgba(20, 20, 35, 0.95)',
    gradientEnd: 'rgba(10, 10, 20, 0.95)',
    accentRGB: '130, 150, 255', // Deep night blue
  },
};

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const useTimeBasedTheme = (): {
  timeOfDay: TimeOfDay;
  theme: ThemeColors;
} => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());

  useEffect(() => {
    const updateTimeOfDay = (): void => {
      setTimeOfDay(getTimeOfDay());
    };

    // Update every minute
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    timeOfDay,
    theme: TIME_THEMES[timeOfDay],
  };
};
