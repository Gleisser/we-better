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

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  streak: number;
  completedDays: HabitDay[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitDay {
  date: string;
  status: HabitStatus;
}

export const calculateStreak = (completedDays: HabitDay[]): number => {
  if (!completedDays.length) return 0;
  
  const sortedDays = [...completedDays]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the latest completion was today or yesterday
  const latestDate = new Date(sortedDays[0].date);
  if (latestDate < yesterday) return 0;
  
  for (let i = 0; i < sortedDays.length; i++) {
    const currentDate = new Date(sortedDays[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (currentDate.toDateString() === expectedDate.toDateString() && 
        sortedDays[i].status === 'completed') {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}; 