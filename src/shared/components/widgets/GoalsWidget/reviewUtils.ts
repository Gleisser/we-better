/**
 * Utility functions for goal review date calculations
 */

import { ReviewFrequency } from './types';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

/**
 * Calculate the next review date based on frequency and last review date
 */
export const calculateNextReviewDate = (
  frequency: ReviewFrequency,
  lastReviewDate?: string | Date
): string => {
  const baseDate = lastReviewDate ? new Date(lastReviewDate) : new Date();
  let nextDate: Date;

  switch (frequency) {
    case 'daily':
      nextDate = addDays(baseDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(baseDate, 1);
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, 1);
      break;
    default:
      nextDate = addWeeks(baseDate, 1); // Default to weekly
  }

  return format(nextDate, 'yyyy-MM-dd');
};

/**
 * Calculate the next review date from current date (for new settings)
 */
export const calculateInitialReviewDate = (frequency: ReviewFrequency): string => {
  return calculateNextReviewDate(frequency, new Date());
};

/**
 * Check if a review is due today or overdue
 */
export const isReviewDue = (nextReviewDate: string | Date): boolean => {
  const reviewDate = new Date(nextReviewDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= today;
};

/**
 * Get days until next review (negative if overdue)
 */
export const getDaysUntilReview = (nextReviewDate: string | Date): number => {
  const reviewDate = new Date(nextReviewDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reviewDate.setHours(0, 0, 0, 0);

  return Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Format review frequency for display
 */
export const formatFrequency = (frequency: ReviewFrequency): string => {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return 'Weekly';
  }
};
