import { DreamBoardData } from '../types';

// API base URL - using import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Get the latest dream board for the current user
 */
export const getLatestDreamBoardData = async (): Promise<DreamBoardData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dream-board`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No dream board found - not an error
        return null;
      }
      throw new Error(`Error fetching dream board: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting dream board data:', error);
    return null;
  }
};

/**
 * Get a specific dream board by ID
 */
export const getDreamBoardById = async (id: string): Promise<DreamBoardData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dream-board/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error fetching dream board: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
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
    const response = await fetch(
      `${API_BASE_URL}/dream-board/history?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching dream board history: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
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
export const saveVisionBoardData = async (data: DreamBoardData): Promise<boolean> => {
  try {
    const url = data.id ? `${API_BASE_URL}/dream-board/${data.id}` : `${API_BASE_URL}/dream-board`;

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
      throw new Error(`Error saving dream board: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving dream board data:', error);
    return false;
  }
};

/**
 * Delete a dream board
 */
export const deleteDreamBoard = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dream-board/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error deleting dream board: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting dream board with ID ${id}:`, error);
    return false;
  }
};

/**
 * Get all dream boards for the current user
 */
export const getAllDreamBoards = async (): Promise<DreamBoardData[]> => {
  try {
    const response = await fetch('/api/dream-board/all');

    if (!response.ok) {
      throw new Error(`Failed to fetch dream boards: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all dream boards:', error);
    return [];
  }
};
