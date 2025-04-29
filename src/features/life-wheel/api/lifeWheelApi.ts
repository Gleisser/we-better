import { LifeCategory } from '../types';
import { supabase } from '@/services/supabaseClient';

interface SaveLifeWheelDataParams {
  categories: LifeCategory[];
  notes?: string;
}

interface LifeWheelEntry {
  id: string;
  user_id: string;
  categories: LifeCategory[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface LifeWheelResponse {
  entry: LifeWheelEntry | null;
}

interface LifeWheelHistoryResponse {
  entries: LifeWheelEntry[];
  total: number;
}

// Base URL for API requests
const API_BASE_URL = '/api/life-wheel';

// Helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  } else {
    console.warn('No authenticated session found, API calls may fail due to auth requirements');
  }
  
  return headers;
}

/**
 * Save life wheel data to the server
 */
export async function saveLifeWheelData(data: SaveLifeWheelDataParams): Promise<LifeWheelEntry> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    const hasContent = Number(response.headers.get('content-length')) > 0;
    
    if (!response.ok) {
      // Handle error response
      if (contentType?.includes('application/json') && hasContent) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save life wheel data');
      } else {
        // Handle empty or non-JSON error responses
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
    }

    // Handle successful response
    if (contentType?.includes('application/json') && hasContent) {
      const responseData = await response.json();
      return responseData.entry;
    } else {
      // If we get an empty response but status is OK, return a minimal object
      console.warn('Empty but successful response received');
      return {
        id: 'temp-id',
        user_id: 'temp-user',
        categories: data.categories,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error saving life wheel data:', error);
    throw error;
  }
}

/**
 * Get the most recent life wheel data for the current user
 */
export async function getLatestLifeWheelData(): Promise<LifeWheelResponse> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers,
    });

    console.log('GET response status:', response.status);
    console.log('GET response headers:', Object.fromEntries([...response.headers.entries()]));
    
    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    const hasContent = Number(response.headers.get('content-length') || '0') > 0;
    
    if (!response.ok) {
      // Handle error response
      if (contentType?.includes('application/json') && hasContent) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get life wheel data');
      } else {
        // Handle empty or non-JSON error responses
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
    }

    // Handle successful response
    if (contentType?.includes('application/json') && hasContent) {
      return await response.json();
    } else {
      // If we get an empty response but status is OK, return an empty entry
      console.warn('Empty but successful response received for GET request');
      return { entry: null };
    }
  } catch (error) {
    console.error('Error getting life wheel data:', error);
    throw error;
  }
}

/**
 * Get historical life wheel entries for the current user
 */
export async function getLifeWheelHistory(
  limit = 10,
  offset = 0,
  startDate?: string,
  endDate?: string
): Promise<LifeWheelHistoryResponse> {
  try {
    const headers = await getAuthHeaders();
    
    // Construct URL with query parameters
    const url = new URL(API_BASE_URL, window.location.origin);
    url.searchParams.append('history', 'true');
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    
    if (startDate) {
      url.searchParams.append('start_date', startDate);
    }
    
    if (endDate) {
      url.searchParams.append('end_date', endDate);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get life wheel history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting life wheel history:', error);
    throw error;
  }
}

/**
 * Update an existing life wheel entry
 */
export async function updateLifeWheelEntry(
  id: string,
  data: Partial<SaveLifeWheelDataParams>
): Promise<LifeWheelEntry> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update life wheel entry');
    }

    const responseData = await response.json();
    return responseData.entry;
  } catch (error) {
    console.error('Error updating life wheel entry:', error);
    throw error;
  }
}

/**
 * Delete a life wheel entry
 */
export async function deleteLifeWheelEntry(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete life wheel entry');
    }
  } catch (error) {
    console.error('Error deleting life wheel entry:', error);
    throw error;
  }
}

/**
 * Get progress comparison between two life wheel entries
 */
export async function getLifeWheelProgress(
  startEntryId: string,
  endEntryId: string
): Promise<{ 
  startDate: string;
  endDate: string;
  categories: {
    id: string;
    name: string;
    progress: number;
    startValue: number;
    endValue: number;
  }[];
}> {
  try {
    const headers = await getAuthHeaders();
    
    // Construct URL with query parameters
    const url = new URL(`${API_BASE_URL}/progress`, window.location.origin);
    url.searchParams.append('start_entry_id', startEntryId);
    url.searchParams.append('end_entry_id', endEntryId);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get life wheel progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting life wheel progress:', error);
    throw error;
  }
} 