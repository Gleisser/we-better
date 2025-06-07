import { Milestone } from '../types';

/**
 * Calculates the progress percentage based on completed milestones
 *
 * @param milestones - Array of milestone objects
 * @param excludeLastMilestone - Whether to exclude the last milestone (e.g., the goal) from calculation
 * @returns A number between 0 and 1 representing the progress percentage
 */
export const calculateProgress = (
  milestones: Milestone[],
  excludeLastMilestone: boolean = false
): number => {
  if (milestones.length === 0) return 0;

  // Sort milestones by date if available
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; // No date goes to the end
    if (!b.date) return -1; // No date goes to the end
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const milestonesToCount =
    excludeLastMilestone && sortedMilestones.length > 1
      ? sortedMilestones.slice(0, -1) // Exclude the last milestone which is assumed to be the goal
      : sortedMilestones;

  if (milestonesToCount.length === 0) return 0;

  const completedCount = milestonesToCount.filter(m => m.completed).length;
  return completedCount / milestonesToCount.length;
};

/**
 * Helper function to get rounded percentage value from progress
 *
 * @param progress - Progress value between 0 and 1
 * @returns A whole number percentage (0-100)
 */
export const getPercentage = (progress: number): number => {
  return Math.round(progress * 100);
};
