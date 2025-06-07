export type HabitCategory = 'health' | 'growth' | 'lifestyle' | 'custom';

export const STATUS_CONFIG = {
  completed: { icon: '✅', label: 'Completed', color: 'emerald' },
  sick: { icon: '🤒', label: 'Sick/Unwell', color: 'orange' },
  weather: { icon: '🌧️', label: 'Weather', color: 'blue' },
  travel: { icon: '✈️', label: 'Travel/Away', color: 'purple' },
  partial: { icon: '🔄', label: 'Partial', color: 'yellow' },
  rescheduled: { icon: '⏳', label: 'Rescheduled', color: 'amber' },
  half: { icon: '↗️', label: 'Half Done', color: 'cyan' },
  medical: { icon: '🏥', label: 'Medical', color: 'red' },
  break: { icon: '🎯', label: 'Break', color: 'indigo' },
  event: { icon: '🎉', label: 'Event', color: 'pink' },
  rest: { icon: '💤', label: 'Rest Day', color: 'violet' }
} as const;

export const CATEGORY_CONFIG: Record<HabitCategory, {
  icon: string;
  label: string;
  colorRGB: string;
}> = {
  health: {
    icon: '💪',
    label: 'Health',
    colorRGB: '59, 130, 246' // Blue
  },
  growth: {
    icon: '🌱',
    label: 'Growth',
    colorRGB: '16, 185, 129' // Emerald
  },
  lifestyle: {
    icon: '⭐️',
    label: 'Lifestyle',
    colorRGB: '139, 92, 246' // Purple
  },
  custom: {
    icon: '✨',
    label: 'Custom',
    colorRGB: '236, 72, 153' // Pink
  }
}; 