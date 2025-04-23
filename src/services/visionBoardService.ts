import { VisionBoardData } from '@/components/vision-board/types';
import { supabase } from './supabaseClient';

// Update the API URL to point to the actual backend server
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/vision-board`;

export interface VisionBoardHistoryResponse {
  entries: VisionBoardData[];
  total: number;
}

export interface VisionBoardHistoryParams {
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
  const token = localStorage.getItem(SUPABASE_AUTH_TOKEN_KEY) || 
                sessionStorage.getItem(SUPABASE_AUTH_TOKEN_KEY);
  
  console.log('Auth token sources:', {
    localStorageKey: SUPABASE_AUTH_TOKEN_KEY,
    localStorageValue: localStorage.getItem(SUPABASE_AUTH_TOKEN_KEY)?.substring(0, 20) + '...',
    sessionStorageValue: sessionStorage.getItem(SUPABASE_AUTH_TOKEN_KEY)?.substring(0, 20) + '...',
    cookiesAvailable: document.cookie.length > 0
  });
                
  if (token) {
    try {
      // Parse the token if it's in JSON format
      const parsedToken = JSON.parse(token);
      console.log('Parsed token structure:', Object.keys(parsedToken));
      
      // Access the session data which contains the access token
      if (parsedToken.session?.access_token) {
        console.log('Using access_token from session in parsed token');
        return parsedToken.session.access_token;
      }
      
      // Fallback to direct access_token if structure is different
      if (parsedToken.access_token) {
        console.log('Using access_token from parsed token');
        return parsedToken.access_token;
      }
    } catch {
      // If not in JSON format, return the token as is
      console.log('Token is not in JSON format, using as-is');
      return token;
    }
  }
  
  // If no token found, check for cookies
  const cookies = document.cookie.split(';');
  console.log('Available cookies:', cookies);
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'sb:token' || name.startsWith('sb-')) {
      console.log('Found token in cookies');
      return value;
    }
  }
  
  // Check for the supabase auth cookie directly
  if (document.cookie.includes('sb-')) {
    console.log('Found supabase cookie starting with sb-');
    // Extract the cookie that starts with sb-
    const supabaseCookie = cookies.find(cookie => cookie.trim().startsWith('sb-'));
    if (supabaseCookie) {
      const [, value] = supabaseCookie.trim().split('=');
      try {
        const decodedValue = decodeURIComponent(value);
        const parsedCookie = JSON.parse(decodedValue);
        if (parsedCookie.access_token) {
          console.log('Using access_token from supabase cookie');
          return parsedCookie.access_token;
        }
      } catch (error) {
        console.error('Error parsing supabase cookie:', error);
      }
    }
  }
  
  console.log('No auth token found');
  return null;
};

/**
 * Get the latest vision board entry for the current user
 * @returns The latest vision board entry
 */
export const getLatestVisionBoard = async (): Promise<VisionBoardData | null> => {
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
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error getting latest vision board: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting latest vision board:', error);
    return null;
  }
};

/**
 * Get a specific vision board entry by ID
 * @param id The vision board entry ID
 * @returns The vision board entry
 */
export const getVisionBoardById = async (id: string): Promise<VisionBoardData | null> => {
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
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error getting vision board with ID ${id}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting vision board with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get vision board history with pagination
 * @param params Pagination and filtering parameters
 * @returns Vision board entries and total count
 */
export const getVisionBoardHistory = async (
  params: VisionBoardHistoryParams = {}
): Promise<VisionBoardHistoryResponse | null> => {
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
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error getting vision board history: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting vision board history:', error);
    return null;
  }
};

/**
 * Create a new vision board entry
 * @param data The vision board data
 * @returns The created vision board entry
 */
export const createVisionBoard = async (data: VisionBoardData): Promise<VisionBoardData | null> => {
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
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error creating vision board: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating vision board:', error);
    return null;
  }
};

/**
 * Update an existing vision board entry
 * @param data The vision board data with ID
 * @returns The updated vision board entry
 */
export const updateVisionBoard = async (data: VisionBoardData): Promise<VisionBoardData | null> => {
  try {
    if (!data.id) {
      throw new Error('Vision board ID is required for updates');
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
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Error updating vision board: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating vision board:', error);
    return null;
  }
};

/**
 * Delete a vision board entry
 * @param id The vision board entry ID
 * @returns True if deletion was successful, false otherwise
 */
export const deleteVisionBoard = async (id: string): Promise<boolean> => {
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
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting vision board with ID ${id}: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting vision board with ID ${id}:`, error);
    return false;
  }
}; 