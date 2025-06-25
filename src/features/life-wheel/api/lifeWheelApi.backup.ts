import { LifeCategory } from '../types';
import { DEFAULT_LIFE_CATEGORIES } from '../constants/categories';

// Initial data - mocking a database
let lifeWheelEntries: {
  id: string;
  date: string;
  categories: LifeCategory[];
}[] = [
  {
    id: 'entry-1',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    categories: DEFAULT_LIFE_CATEGORIES.map(cat => ({
      ...cat,
      value: Math.floor(Math.random() * 6) + 3, // Random value between 3-8
    })),
  },
  {
    id: 'entry-2',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    categories: DEFAULT_LIFE_CATEGORIES.map(cat => ({
      ...cat,
      value: Math.floor(Math.random() * 7) + 2, // Random value between 2-8
    })),
  },
  {
    id: 'entry-3',
    date: new Date().toISOString(), // Today
    categories: DEFAULT_LIFE_CATEGORIES.map(cat => ({
      ...cat,
      value: Math.floor(Math.random() * 8) + 3, // Random value between 3-10
    })),
  },
];

// Get the latest life wheel data
export const getLatestLifeWheelData = async (): Promise<{
  success: boolean;
  entry?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  };
  error?: string;
}> => {
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(() => {
      if (lifeWheelEntries.length > 0) {
        // Sort entries by date (newest first) and return the first entry
        const sortedEntries = [...lifeWheelEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        resolve({
          success: true,
          entry: sortedEntries[0],
        });
      } else {
        resolve({
          success: true,
          entry: {
            id: 'default',
            date: new Date().toISOString(),
            categories: DEFAULT_LIFE_CATEGORIES,
          },
        });
      }
    }, 800); // 800ms delay to simulate network
  });
};

// Save life wheel data
export const saveLifeWheelData = async (data: {
  categories: LifeCategory[];
}): Promise<{
  success: boolean;
  entry?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  };
  error?: string;
}> => {
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(() => {
      try {
        const newEntry = {
          id: `entry-${Date.now()}`,
          date: new Date().toISOString(),
          categories: data.categories,
        };

        // Add to the entries array
        lifeWheelEntries = [...lifeWheelEntries, newEntry];

        resolve({
          success: true,
          entry: newEntry,
        });
      } catch (error) {
        console.error('Failed to save data:', error);
        resolve({
          success: false,
          error: 'Failed to save data',
        });
      }
    }, 1000); // 1s delay to simulate network
  });
};

// Get life wheel history data
export const getLifeWheelHistory = async (): Promise<{
  success: boolean;
  entries?: {
    id: string;
    date: string;
    categories: LifeCategory[];
  }[];
  error?: string;
}> => {
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(() => {
      // Sort entries by date (newest first)
      const sortedEntries = [...lifeWheelEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      resolve({
        success: true,
        entries: sortedEntries,
      });
    }, 1200); // 1.2s delay to simulate network
  });
};
