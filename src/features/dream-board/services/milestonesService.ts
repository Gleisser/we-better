/**
 * Service layer for managing both Dream milestones and DreamBoardContent milestones
 * Provides a unified interface for milestone management across the application
 */

import {
  DreamMilestone,
  getDreamMilestonesForContent,
  getDreamMilestonesForContents,
  createDreamMilestone,
  updateDreamMilestone,
  deleteDreamMilestone,
  toggleMilestoneCompletion,
  getAllDreamMilestones,
} from '../api/dreamMilestonesApi';
import { Milestone } from '../types';

/**
 * Convert backend DreamMilestone to frontend Milestone format
 */
export function convertDreamMilestoneToMilestone(dreamMilestone: DreamMilestone): Milestone {
  return {
    id: dreamMilestone.id,
    title: dreamMilestone.title,
    description: dreamMilestone.description,
    completed: dreamMilestone.completed,
    date: dreamMilestone.due_date,
  };
}

/**
 * Convert frontend Milestone to backend DreamMilestone update format
 */
export function convertMilestoneToUpdateRequest(milestone: Milestone): {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
} {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    completed: milestone.completed,
    due_date: milestone.date,
  };
}

/**
 * Get milestones for a specific dream board content item (converted to frontend format)
 */
export async function getMilestonesForContent(contentId: string): Promise<Milestone[]> {
  const dreamMilestones = await getDreamMilestonesForContent(contentId);
  return dreamMilestones.map(convertDreamMilestoneToMilestone);
}

/**
 * Get milestones for multiple dream board content items (converted to frontend format)
 */
export async function getMilestonesForContents(
  contentIds: string[]
): Promise<Record<string, Milestone[]>> {
  const dreamMilestones = await getDreamMilestonesForContents(contentIds);

  const converted: Record<string, Milestone[]> = {};
  Object.entries(dreamMilestones).forEach(([contentId, milestones]) => {
    converted[contentId] = milestones.map(convertDreamMilestoneToMilestone);
  });

  return converted;
}

/**
 * Create a new milestone for a dream board content item
 */
export async function createMilestoneForContent(
  contentId: string,
  milestone: {
    title: string;
    description?: string;
    date?: string; // YYYY-MM-DD format
  }
): Promise<Milestone> {
  const dreamMilestone = await createDreamMilestone({
    dream_board_content_id: contentId,
    title: milestone.title,
    description: milestone.description,
    due_date: milestone.date,
  });

  return convertDreamMilestoneToMilestone(dreamMilestone);
}

/**
 * Update a milestone
 */
export async function updateMilestoneForContent(milestone: Milestone): Promise<Milestone> {
  const updateData = convertMilestoneToUpdateRequest(milestone);
  const updatedDreamMilestone = await updateDreamMilestone(updateData);
  return convertDreamMilestoneToMilestone(updatedDreamMilestone);
}

/**
 * Delete a milestone
 */
export async function deleteMilestoneForContent(milestoneId: string): Promise<void> {
  await deleteDreamMilestone(milestoneId);
}

/**
 * Toggle milestone completion
 */
export async function toggleMilestoneCompletionForContent(milestoneId: string): Promise<Milestone> {
  const updatedDreamMilestone = await toggleMilestoneCompletion(milestoneId);
  return convertDreamMilestoneToMilestone(updatedDreamMilestone);
}

/**
 * Get all milestones for the current user (useful for dashboard views)
 */
export async function getAllUserMilestones(params?: {
  completed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Milestone[]> {
  const dreamMilestones = await getAllDreamMilestones(params);
  return dreamMilestones.map(convertDreamMilestoneToMilestone);
}

/**
 * Calculate progress for a dream based on its milestones
 */
export function calculateMilestoneProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const completedCount = milestones.filter(m => m.completed).length;
  return completedCount / milestones.length;
}

/**
 * Group milestones by completion status
 */
export function groupMilestonesByStatus(milestones: Milestone[]): {
  completed: Milestone[];
  pending: Milestone[];
  overdue: Milestone[];
} {
  const now = new Date();

  return milestones.reduce(
    (groups, milestone) => {
      if (milestone.completed) {
        groups.completed.push(milestone);
      } else if (milestone.date && new Date(milestone.date) < now) {
        groups.overdue.push(milestone);
      } else {
        groups.pending.push(milestone);
      }
      return groups;
    },
    { completed: [], pending: [], overdue: [] } as {
      completed: Milestone[];
      pending: Milestone[];
      overdue: Milestone[];
    }
  );
}
