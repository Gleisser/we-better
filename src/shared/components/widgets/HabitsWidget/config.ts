export type HabitCategory = 'health' | 'growth' | 'lifestyle' | 'custom';

export const STATUS_CONFIG = {
  completed: { icon: '✅', color: 'emerald' },
  sick: { icon: '🤒', color: 'orange' },
  weather: { icon: '🌧️', color: 'blue' },
  travel: { icon: '✈️', color: 'purple' },
  partial: { icon: '🔄', color: 'yellow' },
  rescheduled: { icon: '⏳', color: 'amber' },
  half: { icon: '↗️', color: 'cyan' },
  medical: { icon: '🏥', color: 'red' },
  break: { icon: '🎯', color: 'indigo' },
  event: { icon: '🎉', color: 'pink' },
  rest: { icon: '💤', color: 'violet' },
} as const;

export const CATEGORY_CONFIG: Record<
  HabitCategory,
  {
    icon: string;
    colorRGB: string;
  }
> = {
  health: {
    icon: '💪',
    colorRGB: '59, 130, 246', // Blue
  },
  growth: {
    icon: '🌱',
    colorRGB: '16, 185, 129', // Emerald
  },
  lifestyle: {
    icon: '⭐️',
    colorRGB: '139, 92, 246', // Purple
  },
  custom: {
    icon: '✨',
    colorRGB: '236, 72, 153', // Pink
  },
};
