import { LifeCategory } from '../types';
import { supabase } from '@/core/services/supabaseClient';

// Define the API URL - following the same pattern as dream board
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/life-wheel`;

/**
 * Backend response interfaces to match the actual API
 */
interface LifeWheelEntry {
  id: string;
  user_id: string;
  categories: LifeCategory[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface LifeWheelHistoryResponse {
  entries: LifeWheelEntry[];
  total: number;
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
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
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

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
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
 * Get the latest life wheel data for the current user
 */
export const getLatestLifeWheelData = async (): Promise<{
  success: boolean;
  entry?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  };
  error?: string;
}> => {
  try {
    const response = await apiRequest<{ entry: LifeWheelEntry | null }>(API_URL);

    if (response?.entry) {
      // Transform backend response to match expected frontend format
      return {
        success: true,
        entry: {
          id: response.entry.id,
          date: response.entry.created_at,
          categories: response.entry.categories,
        },
      };
    } else {
      // No entries found - return success with no entry
      return {
        success: true,
        entry: undefined,
      };
    }
  } catch (error) {
    console.error('Error getting latest life wheel data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get life wheel data',
    };
  }
};

/**
 * Check if user has an entry for today and get it
 */
export const getTodaysLifeWheelData = async (): Promise<{
  success: boolean;
  entry?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  };
  hasEntryToday: boolean;
  error?: string;
}> => {
  try {
    const response = await apiRequest<{
      entry: LifeWheelEntry | null;
      hasEntryToday: boolean;
    }>(`${API_URL}?today=true`);

    if (response?.entry) {
      // Transform backend response to match expected frontend format
      return {
        success: true,
        entry: {
          id: response.entry.id,
          date: response.entry.created_at,
          categories: response.entry.categories,
        },
        hasEntryToday: response.hasEntryToday,
      };
    } else {
      // No entry for today
      return {
        success: true,
        entry: undefined,
        hasEntryToday: false,
      };
    }
  } catch (error) {
    console.error("Error getting today's life wheel data:", error);
    return {
      success: false,
      hasEntryToday: false,
      error: error instanceof Error ? error.message : "Failed to get today's life wheel data",
    };
  }
};

/**
 * Save life wheel data - creates a new entry or updates today's entry if it exists
 */
export const saveLifeWheelData = async (data: {
  categories: LifeCategory[];
  notes?: string;
  entryId?: string; // If provided, updates this entry instead of creating new
}): Promise<{
  success: boolean;
  entry?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  };
  error?: string;
  isUpdate?: boolean;
}> => {
  try {
    let response;
    let isUpdate = false;

    if (data.entryId) {
      // Update existing entry
      response = await apiRequest<{ entry: LifeWheelEntry }>(
        `${API_URL}/${data.entryId}`,
        'PATCH',
        {
          categories: data.categories,
          notes: data.notes,
        }
      );
      isUpdate = true;
    } else {
      // Create new entry
      response = await apiRequest<{ success: boolean; entry: LifeWheelEntry }>(API_URL, 'POST', {
        categories: data.categories,
        notes: data.notes,
      });
    }

    if (response?.entry) {
      return {
        success: true,
        entry: {
          id: response.entry.id,
          date: response.entry.created_at,
          categories: response.entry.categories,
        },
        isUpdate,
      };
    } else {
      return {
        success: false,
        error: `Failed to ${isUpdate ? 'update' : 'save'} life wheel data`,
        isUpdate,
      };
    }
  } catch (error) {
    console.error(`Error ${data.entryId ? 'updating' : 'saving'} life wheel data:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to ${data.entryId ? 'update' : 'save'} life wheel data`,
      isUpdate: !!data.entryId,
    };
  }
};

/**
 * Get life wheel history data for the current user
 */
export const getLifeWheelHistory = async (
  limit = 10,
  offset = 0
): Promise<{
  success: boolean;
  entries?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  }[];
  error?: string;
}> => {
  try {
    const response = await apiRequest<LifeWheelHistoryResponse>(
      `${API_URL}?history=true&limit=${limit}&offset=${offset}`
    );

    if (response?.entries) {
      // Transform backend response to match expected frontend format
      const transformedEntries = response.entries.map(entry => ({
        id: entry.id,
        date: entry.created_at,
        categories: entry.categories,
      }));

      return {
        success: true,
        entries: transformedEntries,
      };
    } else {
      return {
        success: true,
        entries: [],
      };
    }
  } catch (error) {
    console.error('Error getting life wheel history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get life wheel history',
    };
  }
};

/**
 * Update an existing life wheel entry
 */
export const updateLifeWheelData = async (
  id: string,
  data: {
    categories: LifeCategory[];
    notes?: string;
  }
): Promise<{
  success: boolean;
  entry?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  };
  error?: string;
}> => {
  try {
    const response = await apiRequest<{ entry: LifeWheelEntry }>(`${API_URL}/${id}`, 'PUT', {
      categories: data.categories,
      notes: data.notes,
    });

    if (response?.entry) {
      return {
        success: true,
        entry: {
          id: response.entry.id,
          date: response.entry.created_at,
          categories: response.entry.categories,
        },
      };
    } else {
      return {
        success: false,
        error: 'Failed to update life wheel data',
      };
    }
  } catch (error) {
    console.error('Error updating life wheel data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update life wheel data',
    };
  }
};

/**
 * Delete a life wheel entry
 */
export const deleteLifeWheelEntry = async (
  id: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await apiRequest(`${API_URL}/${id}`, 'DELETE');
    return { success: true };
  } catch (error) {
    console.error('Error deleting life wheel entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete life wheel entry',
    };
  }
};

/**
 * Get life wheel progress data comparing two entries
 */
export const getLifeWheelProgress = async (
  startEntryId: string,
  endEntryId: string
): Promise<{
  success: boolean;
  progress?: {
    startEntry: { id: string; date: string; categories: LifeCategory[] };
    endEntry: { id: string; date: string; categories: LifeCategory[] };
  };
  error?: string;
}> => {
  try {
    const response = await apiRequest<{
      startEntry: LifeWheelEntry;
      endEntry: LifeWheelEntry;
    }>(`${API_URL}/progress?start=${startEntryId}&end=${endEntryId}`);

    if (response?.startEntry && response?.endEntry) {
      return {
        success: true,
        progress: {
          startEntry: {
            id: response.startEntry.id,
            date: response.startEntry.created_at,
            categories: response.startEntry.categories,
          },
          endEntry: {
            id: response.endEntry.id,
            date: response.endEntry.created_at,
            categories: response.endEntry.categories,
          },
        },
      };
    } else {
      return {
        success: false,
        error: 'Failed to get life wheel progress data',
      };
    }
  } catch (error) {
    console.error('Error getting life wheel progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get life wheel progress',
    };
  }
};
