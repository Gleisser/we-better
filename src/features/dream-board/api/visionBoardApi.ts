import { VisionBoardData } from '../types';

// API base URL - using import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Get the latest vision board for the current user
 */
export const getLatestVisionBoardData = async (): Promise<VisionBoardData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vision-board`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No vision board found - not an error
        return null;
      }
      throw new Error(`Error fetching vision board: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting vision board data:', error);
    return null;
  }
};

/**
 * Get a specific vision board by ID
 */
export const getVisionBoardById = async (id: string): Promise<VisionBoardData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vision-board/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error fetching vision board: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting vision board with ID ${id}:`, error);
    return null;
  }
};

/**
 * Get the user's vision board history
 */
export const getVisionBoardHistory = async (limit = 10, offset = 0): Promise<VisionBoardData[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vision-board/history?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching vision board history: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting vision board history:', error);
    return [];
  }
};

/**
 * Save vision board data
 * If no ID is provided, it will create a new vision board
 * If an ID is provided, it will update the existing vision board
 */
export const saveVisionBoardData = async (data: VisionBoardData): Promise<boolean> => {
  try {
    const url = data.id
      ? `${API_BASE_URL}/vision-board/${data.id}`
      : `${API_BASE_URL}/vision-board`;

    const method = data.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error saving vision board: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving vision board data:', error);
    return false;
  }
};

/**
 * Delete a vision board
 */
export const deleteVisionBoard = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vision-board/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error deleting vision board: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting vision board with ID ${id}:`, error);
    return false;
  }
};

/**
 * Get all vision boards for the current user
 */
export const getAllVisionBoards = async (): Promise<VisionBoardData[]> => {
  try {
    const response = await fetch('/api/vision-board/all');

    if (!response.ok) {
      throw new Error(`Failed to fetch vision boards: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all vision boards:', error);
    return [];
  }
};
