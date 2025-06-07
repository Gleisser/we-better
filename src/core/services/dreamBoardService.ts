import { DreamBoardData } from '@/features/dream-board/types';
import { supabase } from './supabaseClient';

// Update the API URL to point to the actual backend server
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/dream-board`;

export interface DreamBoardHistoryResponse {
  entries: DreamBoardData[];
  total: number;
}

export interface DreamBoardHistoryParams {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Get the auth token from localStorage or cookie
 * @returns The auth token string or null if not found
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Get the session directly from Supabase client
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return data.session.access_token;
    }
  } catch (error) {
    console.error('Error getting session from Supabase:', error);
  }

  // Use the correct storage key as defined in supabaseClient.ts
  const SUPABASE_AUTH_TOKEN_KEY = 'we-better-auth-token';

  // Try to get the token from localStorage
  const token =
    localStorage.getItem(SUPABASE_AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(SUPABASE_AUTH_TOKEN_KEY);

  if (token) {
    try {
      // Parse the token if it's in JSON format
      const parsedToken = JSON.parse(token);

      // Access the session data which contains the access token
      if (parsedToken.session?.access_token) {
        return parsedToken.session.access_token;
      }

      // Fallback to direct access_token if structure is different
      if (parsedToken.access_token) {
        return parsedToken.access_token;
      }
    } catch {
      // If not in JSON format, return the token as is
      return token;
    }
  }

  // If no token found, check for cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'sb:token' || name.startsWith('sb-')) {
      return value;
    }
  }

  // Check for the supabase auth cookie directly
  if (document.cookie.includes('sb-')) {
    // Extract the cookie that starts with sb-
    const supabaseCookie = cookies.find(cookie => cookie.trim().startsWith('sb-'));
    if (supabaseCookie) {
      const [, value] = supabaseCookie.trim().split('=');
      try {
        const decodedValue = decodeURIComponent(value);
        const parsedCookie = JSON.parse(decodedValue);
        if (parsedCookie.access_token) {
          return parsedCookie.access_token;
        }
      } catch (error) {
        console.error('Error parsing supabase cookie:', error);
      }
    }
  }

  return null;
};

/**
 * Get the latest dream board entry for the current user
 * @returns The latest dream board entry
 */
export const getLatestDreamBoard = async (): Promise<DreamBoardData | null> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error getting latest dream board: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting latest dream board:', error);
    return null;
  }
};

/**
 * Get a specific dream board entry by ID
 * @param id The dream board entry ID
 * @returns The dream board entry
 */
export const getDreamBoardById = async (id: string): Promise<DreamBoardData | null> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}?id=${id}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error getting dream board with ID ${id}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error getting dream board with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get dream board history with pagination
 * @param params Pagination and filtering parameters
 * @returns Dream board entries and total count
 */
export const getDreamBoardHistory = async (
  params: DreamBoardHistoryParams = {}
): Promise<DreamBoardHistoryResponse | null> => {
  try {
    const { limit = 10, offset = 0, startDate, endDate } = params;
    let url = `${API_URL}/history?limit=${limit}&offset=${offset}`;

    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error getting dream board history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting dream board history:', error);
    return null;
  }
};

/**
 * Create a new dream board entry
 * @param data The dream board data
 * @returns The created dream board entry
 */
export const createDreamBoard = async (data: DreamBoardData): Promise<DreamBoardData | null> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error creating dream board: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating dream board:', error);
    return null;
  }
};

/**
 * Update an existing dream board entry
 * @param data The dream board data with ID
 * @returns The updated dream board entry
 */
export const updateDreamBoard = async (data: DreamBoardData): Promise<DreamBoardData | null> => {
  try {
    if (!data.id) {
      throw new Error('Dream board ID is required for updates');
    }

    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error updating dream board: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating dream board:', error);
    return null;
  }
};

/**
 * Delete a dream board entry
 * @param id The dream board entry ID
 * @returns True if deletion was successful, false otherwise
 */
export const deleteDreamBoard = async (id: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}?id=${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error deleting dream board with ID ${id}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting dream board with ID ${id}:`, error);
    return false;
  }
};
