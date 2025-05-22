/**
 * Goals Service - API integration for goals management
 * Follows the same patterns as habitsService for consistency
 */

import { supabase } from './supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/goals`;

// Goal categories matching the backend
export type GoalCategory = 'learning' | 'fitness' | 'career' | 'personal';

// Review frequency options
export type ReviewFrequency = 'daily' | 'weekly' | 'monthly';

// Main goal entity from API
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: GoalCategory;
  progress: number; // 0-100
  target_date?: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

// Milestone entity from API
export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Goal with milestones included
export interface GoalWithMilestones extends Goal {
  milestones: Milestone[];
}

// User review settings
export interface UserReviewSettings {
  user_id: string;
  frequency: ReviewFrequency;
  notification_preferences: Record<string, boolean>;
  next_review_date?: string;
  reminder_days?: number;
  created_at: string;
  updated_at: string;
}

// Goal statistics
export interface GoalStats {
  total_goals: number;
  completed_goals: number;
  in_progress_goals: number;
  average_progress: number;
  goals_by_category: Record<GoalCategory, number>;
  completion_rate: number;
}

// API Response types
export interface GoalsResponse {
  goals: Goal[] | GoalWithMilestones[];
  total: number;
}

export interface MilestonesResponse {
  milestones: Milestone[];
  total: number;
}

// API Error type
export interface ApiError {
  error: string;
  status?: number;
}

/**
 * Get the auth token from Supabase session or storage
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Handle API requests with proper authentication and error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
): Promise<T | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    // Implement exponential backoff for retries
    const MAX_RETRIES = 3;
    let retries = 0;
    let response: Response;

    while (true) {
      try {
        response = await fetch(endpoint, config);
        break;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        // Exponential backoff: 1s, 2s, 4s, etc.
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
      }
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Trigger auth refresh or redirect to login
        throw new Error('Authentication expired');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // For DELETE operations that don't return content
    if (method === 'DELETE' && response.status === 204) {
      return { success: true } as unknown as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * GOALS API FUNCTIONS
 */

// Fetch goals for the user
export const fetchGoals = async (
  category?: GoalCategory,
  includeMilestones = false,
  limit = 20,
  offset = 0
): Promise<GoalsResponse | null> => {
  try {
    let url = `${API_URL}?limit=${limit}&offset=${offset}`;

    if (category) url += `&category=${category}`;
    if (includeMilestones) url += `&include_milestones=true`;

    return await apiRequest<GoalsResponse>(url);
  } catch (error) {
    console.error('Error getting goals:', error);
    return null;
  }
};

// Create a new goal
export const createGoal = async (
  title: string,
  category: GoalCategory,
  progress = 0,
  targetDate?: string
): Promise<Goal | null> => {
  try {
    return await apiRequest<Goal>(API_URL, 'POST', {
      title,
      category,
      progress,
      target_date: targetDate,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
};

// Update a goal
export const updateGoal = async (
  goalId: string,
  updates: {
    title?: string;
    category?: GoalCategory;
    progress?: number;
    target_date?: string;
  }
): Promise<Goal | null> => {
  try {
    return await apiRequest<Goal>(`${API_URL}/${goalId}`, 'PUT', updates);
  } catch (error) {
    console.error(`Error updating goal ${goalId}:`, error);
    return null;
  }
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<boolean> => {
  try {
    await apiRequest<{ message: string }>(`${API_URL}/${goalId}`, 'DELETE');
    return true;
  } catch (error) {
    console.error(`Error deleting goal ${goalId}:`, error);
    return false;
  }
};

// Get a specific goal by ID
export const fetchGoalById = async (
  goalId: string,
  includeMilestones = false
): Promise<Goal | GoalWithMilestones | null> => {
  try {
    let url = `${API_URL}/${goalId}`;
    if (includeMilestones) url += '?include_milestones=true';

    return await apiRequest<Goal | GoalWithMilestones>(url);
  } catch (error) {
    console.error(`Error getting goal ${goalId}:`, error);
    return null;
  }
};

/**
 * MILESTONES API FUNCTIONS
 */

// Fetch milestones for a goal
export const fetchMilestones = async (
  goalId: string,
  limit = 50,
  offset = 0
): Promise<MilestonesResponse | null> => {
  try {
    const url = `${API_URL}/${goalId}/milestones?limit=${limit}&offset=${offset}`;
    return await apiRequest<MilestonesResponse>(url);
  } catch (error) {
    console.error(`Error getting milestones for goal ${goalId}:`, error);
    return null;
  }
};

// Create a new milestone
export const createMilestone = async (
  goalId: string,
  title: string,
  completed = false
): Promise<Milestone | null> => {
  try {
    return await apiRequest<Milestone>(`${API_URL}/${goalId}/milestones`, 'POST', {
      title,
      completed,
    });
  } catch (error) {
    console.error(`Error creating milestone for goal ${goalId}:`, error);
    return null;
  }
};

// Update a milestone
export const updateMilestone = async (
  goalId: string,
  milestoneId: string,
  updates: {
    title?: string;
    completed?: boolean;
  }
): Promise<Milestone | null> => {
  try {
    return await apiRequest<Milestone>(`${API_URL}/${goalId}/milestones`, 'PUT', {
      milestone_id: milestoneId,
      ...updates,
    });
  } catch (error) {
    console.error(`Error updating milestone ${milestoneId}:`, error);
    return null;
  }
};

// Delete a milestone
export const deleteMilestone = async (goalId: string, milestoneId: string): Promise<boolean> => {
  try {
    await apiRequest<{ message: string }>(
      `${API_URL}/${goalId}/milestones?milestone_id=${milestoneId}`,
      'DELETE'
    );
    return true;
  } catch (error) {
    console.error(`Error deleting milestone ${milestoneId}:`, error);
    return false;
  }
};

/**
 * REVIEW SETTINGS API FUNCTIONS
 */

// Fetch user review settings
export const fetchReviewSettings = async (): Promise<UserReviewSettings | null> => {
  try {
    return await apiRequest<UserReviewSettings>(`${API_URL}/settings`);
  } catch (error) {
    console.error('Error getting review settings:', error);
    return null;
  }
};

// Create or update review settings
export const upsertReviewSettings = async (settings: {
  frequency: ReviewFrequency;
  notification_preferences: Record<string, boolean>;
  next_review_date?: string;
  reminder_days?: number;
}): Promise<UserReviewSettings | null> => {
  try {
    return await apiRequest<UserReviewSettings>(`${API_URL}/settings`, 'POST', settings);
  } catch (error) {
    console.error('Error creating/updating review settings:', error);
    return null;
  }
};

// Update review settings
export const updateReviewSettings = async (settings: {
  frequency?: ReviewFrequency;
  notification_preferences?: Record<string, boolean>;
  next_review_date?: string;
  reminder_days?: number;
}): Promise<UserReviewSettings | null> => {
  try {
    return await apiRequest<UserReviewSettings>(`${API_URL}/settings`, 'PUT', settings);
  } catch (error) {
    console.error('Error updating review settings:', error);
    return null;
  }
};

/**
 * STATISTICS API FUNCTIONS
 */

// Fetch goal statistics
export const fetchGoalStats = async (): Promise<GoalStats | null> => {
  try {
    return await apiRequest<GoalStats>(`${API_URL}/stats`);
  } catch (error) {
    console.error('Error getting goal stats:', error);
    return null;
  }
};

/**
 * UTILITY FUNCTIONS
 */

// Progress helpers
export const increaseProgress = async (goalId: string, increment = 5): Promise<Goal | null> => {
  // First fetch current goal to get current progress
  const currentGoal = await fetchGoalById(goalId);
  if (!currentGoal) return null;

  const newProgress = Math.min(100, (currentGoal as Goal).progress + increment);
  return updateGoal(goalId, { progress: newProgress });
};

export const decreaseProgress = async (goalId: string, decrement = 5): Promise<Goal | null> => {
  // First fetch current goal to get current progress
  const currentGoal = await fetchGoalById(goalId);
  if (!currentGoal) return null;

  const newProgress = Math.max(0, (currentGoal as Goal).progress - decrement);
  return updateGoal(goalId, { progress: newProgress });
};

// Toggle milestone completion
export const toggleMilestoneCompletion = async (
  goalId: string,
  milestoneId: string,
  completed: boolean
): Promise<Milestone | null> => {
  return updateMilestone(goalId, milestoneId, { completed });
};

// Calculate goal completion percentage based on milestones
export const calculateGoalProgressFromMilestones = (milestones: Milestone[]): number => {
  if (milestones.length === 0) return 0;
  const completedCount = milestones.filter(m => m.completed).length;
  return Math.round((completedCount / milestones.length) * 100);
};
