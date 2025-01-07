export type HabitStatus = 
  // Core Statuses
  | 'completed'
  | 'sick'
  | 'weather'
  | 'travel'
  // Partial Completion
  | 'partial'
  | 'rescheduled'
  | 'half'
  // Valid Skip
  | 'medical'
  | 'break'
  | 'event'
  | 'rest'
  | null;

export interface HabitDay {
  date: string; // ISO date string
  status: HabitStatus;
}

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