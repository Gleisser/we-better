import { DreamBoardData, Milestone } from '../types';
import { supabase } from '@/core/services/supabaseClient';
import {
  deleteDreamBoardStorageFiles,
  normalizeDreamBoardDataForPersistence,
} from '../utils/imageStorage';
import { DreamChallenge } from './dreamChallengesApi';
import { DreamMilestone } from './dreamMilestonesApi';
import { DreamWeatherResponse } from './dreamWeatherApi';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/dream-board`;
const OVERVIEW_API_URL = `${API_URL}/overview`;

type ApiRequestOptions = {
  onUploadProgress?: (percent: number) => void;
};

type DreamBoardOverviewApiResponse = {
  board: DreamBoardData | null;
  progressByContentId: Record<string, number>;
  milestonesByContentId: Record<string, DreamMilestone[]>;
  weather: DreamWeatherResponse | null;
  challenges: {
    activeChallenges: DreamChallenge[];
    completedChallenges: DreamChallenge[];
    latestChallengeCompletionById: Record<string, string>;
  };
};

export type DreamBoardOverviewData = {
  board: DreamBoardData | null;
  progressByContentId: Record<string, number>;
  milestonesByContentId: Record<string, Milestone[]>;
  weather: DreamWeatherResponse | null;
  challenges: {
    activeChallenges: DreamChallenge[];
    completedChallenges: DreamChallenge[];
    latestChallengeCompletionById: Record<string, string>;
  };
};

const convertDreamMilestoneToMilestone = (dreamMilestone: DreamMilestone): Milestone => ({
  id: dreamMilestone.id,
  title: dreamMilestone.title,
  description: dreamMilestone.description,
  completed: dreamMilestone.completed,
  date: dreamMilestone.due_date,
});

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
  body?: Record<string, unknown> | DreamBoardData,
  options?: ApiRequestOptions
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

    if (options?.onUploadProgress && body && (method === 'POST' || method === 'PUT')) {
      return await new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, endpoint);
        xhr.withCredentials = true;
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.upload.onprogress = event => {
          if (!event.lengthComputable) {
            return;
          }

          const percent = Math.min(
            100,
            Math.max(0, Math.round((event.loaded / event.total) * 100))
          );
          options.onUploadProgress?.(percent);
        };

        xhr.onerror = () => reject(new Error('Network error while uploading dream board data'));
        xhr.onabort = () => reject(new Error('Dream board upload was aborted'));
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            if (xhr.status === 401) {
              reject(new Error('Authentication expired'));
              return;
            }
            reject(new Error(`API request failed: ${xhr.statusText || String(xhr.status)}`));
            return;
          }

          options.onUploadProgress?.(100);

          if (!xhr.responseText) {
            resolve({ success: true } as unknown as T);
            return;
          }

          try {
            resolve(JSON.parse(xhr.responseText) as T);
          } catch (error) {
            reject(error);
          }
        };

        const uploadBody = typeof config.body === 'string' ? config.body : JSON.stringify(body);
        xhr.send(uploadBody);
      });
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
 * Get the latest dream board for the current user
 */
export const getLatestDreamBoardData = async (): Promise<DreamBoardData | null> => {
  try {
    return await apiRequest<DreamBoardData>(API_URL);
  } catch (error) {
    console.error('Error getting dream board data:', error);
    return null;
  }
};

/**
 * Get the dream board overview payload for the current user
 */
export const getDreamBoardOverview = async (): Promise<DreamBoardOverviewData | null> => {
  try {
    const response = await apiRequest<DreamBoardOverviewApiResponse>(OVERVIEW_API_URL);
    if (!response) {
      return null;
    }

    const milestonesByContentId = Object.fromEntries(
      Object.entries(response.milestonesByContentId || {}).map(([contentId, milestones]) => [
        contentId,
        milestones.map(convertDreamMilestoneToMilestone),
      ])
    );

    return {
      board: response.board,
      progressByContentId: response.progressByContentId || {},
      milestonesByContentId,
      weather: response.weather,
      challenges: {
        activeChallenges: response.challenges?.activeChallenges || [],
        completedChallenges: response.challenges?.completedChallenges || [],
        latestChallengeCompletionById: response.challenges?.latestChallengeCompletionById || {},
      },
    };
  } catch (error) {
    console.error('Error getting dream board overview:', error);
    return null;
  }
};

/**
 * Get a specific dream board by ID
 */
export const getDreamBoardById = async (id: string): Promise<DreamBoardData | null> => {
  try {
    return await apiRequest<DreamBoardData>(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error getting dream board with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get the user's dream board history
 */
export const getDreamBoardHistory = async (limit = 10, offset = 0): Promise<DreamBoardData[]> => {
  try {
    const response = await apiRequest<{ entries: DreamBoardData[]; total: number }>(
      `${API_URL}/history?limit=${limit}&offset=${offset}`
    );
    return response?.entries || [];
  } catch (error) {
    console.error('Error getting dream board history:', error);
    return [];
  }
};

/**
 * Save dream board data
 * If no ID is provided, it will create a new dream board
 * If an ID is provided, it will update the existing dream board
 */
export const saveDreamBoardData = async (
  data: DreamBoardData,
  options?: ApiRequestOptions
): Promise<DreamBoardData | null> => {
  try {
    const normalizationResult = await normalizeDreamBoardDataForPersistence({
      ...data,
      title: data.title || 'My Vision Board',
    });
    const normalizedData = normalizationResult.data;
    const endpoint = normalizedData.id ? `${API_URL}/${normalizedData.id}` : API_URL;
    const method = normalizedData.id ? 'PUT' : 'POST';

    try {
      const result = await apiRequest<DreamBoardData>(endpoint, method, normalizedData, options);
      return result;
    } catch (error) {
      try {
        await deleteDreamBoardStorageFiles(normalizationResult.uploadedRefs);
      } catch (cleanupError) {
        console.error(
          'Error cleaning up uploaded dream board images after save failure:',
          cleanupError
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error saving dream board data:', error);
    return null;
  }
};

/**
 * Delete ALL dream boards for the current user
 */
export const deleteDreamBoard = async (_id: string): Promise<boolean> => {
  try {
    // We ignore the ID parameter and delete all dream boards for the user
    // This is intentional - when a user deletes "their dream board",
    // we delete all versions/history to prevent confusion
    const result = await apiRequest<{ success: boolean }>(`${API_URL}/all`, 'DELETE');
    return result?.success || false;
  } catch (error) {
    console.error('Error deleting all dream boards:', error);
    return false;
  }
};

/**
 * Get all dream boards for the current user
 */
export const getAllDreamBoards = async (): Promise<DreamBoardData[]> => {
  try {
    const response = await apiRequest<{ entries: DreamBoardData[]; total: number }>(
      `${API_URL}/history?limit=100&offset=0`
    );
    return response?.entries || [];
  } catch (error) {
    console.error('Error fetching all dream boards:', error);
    return [];
  }
};
