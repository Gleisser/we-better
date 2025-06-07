import { supabase } from './supabaseClient'; // Assuming supabase client is used for auth token

// Interfaces based on MOCK_CATEGORIES in StoriesBar.tsx
// Assuming items are part of the category for now, adjust if LifeStories expects a flat list of items later
export interface StoryItem {
  // Example: if stories have individual items with titles, images etc.
  // For now, MOCK_CATEGORIES doesn't have this level of detail per story, just category level.
  // If LifeStories needs specific items, this structure will need to be more detailed.
  // Let's assume for now the "story" is the category itself.
  id: string; // Corresponds to category id
  title: string; // Corresponds to category name for display
  // Add other fields if LifeStories expects them per item, e.g., imageUrl
}

export interface StoryCategory {
  id: string;
  name: string;
  color: { from: string; to: string };
  icon: string;
  score?: number; 
  hasUpdate?: boolean;
  items?: StoryItem[]; // Optional: if categories contain multiple story items. 
                       // MOCK_CATEGORIES implies categories are the stories themselves.
}

export interface StoriesResponse {
  categories: StoryCategory[];
}

// --- COPIED FROM habitsService.ts (or similar service) ---
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, unknown>,
  isPublic = false, // Added for public endpoints like stories
): Promise<T | null> => {
  try {
    let token: string | null = null;
    if (!isPublic) {
      token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      // credentials: 'include', // May not be needed for public GETs, or if using token
    };
    if (!isPublic && token) {
        config.credentials = 'include';
    }


    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

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
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
      }
    }

    if (!response.ok) {
      if (response.status === 401 && !isPublic) {
        throw new Error('Authentication expired');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    if (method === 'DELETE' && response.status === 204) {
      return { success: true } as unknown as T;
    }
    if (response.status === 204) { // Handle 204 No Content for GET as well
        return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};
// --- END COPIED SECTION ---

// Mock data based on MOCK_CATEGORIES from StoriesBar.tsx
// For now, we'll treat each category as a "story" container.
// If LifeStories.tsx expects a different structure (e.g., items within categories),
// this mock and the interfaces will need adjustment.
const MOCK_CATEGORIES_DATA: StoryCategory[] = [
  { id: 'social', name: 'Social', color: { from: '#8B5CF6', to: '#D946EF' }, icon: '👥', score: 85, hasUpdate: true, items: [{id: 'social-1', title: 'Social Story 1'}] },
  { id: 'health', name: 'Health', color: { from: '#10B981', to: '#34D399' }, icon: '💪', score: 70, hasUpdate: true, items: [{id: 'health-1', title: 'Health Story 1'}] },
  { id: 'selfCare', name: 'Self Care', color: { from: '#F59E0B', to: '#FBBF24' }, icon: '🧘‍♂️', score: 65, hasUpdate: false, items: [{id: 'selfCare-1', title: 'Self Care Story 1'}] },
  { id: 'money', name: 'Money', color: { from: '#3B82F6', to: '#60A5FA' }, icon: '💰', score: 75, hasUpdate: true, items: [{id: 'money-1', title: 'Money Story 1'}] },
  { id: 'family', name: 'Family', color: { from: '#EC4899', to: '#F472B6' }, icon: '👨‍👩‍👧‍👦', score: 90, hasUpdate: true, items: [{id: 'family-1', title: 'Family Story 1'}] },
  { id: 'spirituality', name: 'Spirituality', color: { from: '#8B5CF6', to: '#A78BFA' }, icon: '🧘‍♀️', score: 60, hasUpdate: false, items: [{id: 'spirituality-1', title: 'Spirituality Story 1'}] },
  { id: 'relationship', name: 'Relationship', color: { from: '#EF4444', to: '#F87171' }, icon: '❤️', score: 80, hasUpdate: true, items: [{id: 'relationship-1', title: 'Relationship Story 1'}] },
  { id: 'career', name: 'Career', color: { from: '#6366F1', to: '#818CF8' }, icon: '💼', score: 85, hasUpdate: true, items: [{id: 'career-1', title: 'Career Story 1'}] },
];

const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/stories`;

export const fetchStories = async (): Promise<StoriesResponse | null> => {
  // Simulate API call
  // In a real scenario, this would be:
  // return await apiRequest<StoriesResponse>(API_URL, 'GET', undefined, true); // true for public endpoint
  
  console.log('Simulating stories fetch from storiesService...');
  return new Promise(resolve => {
    setTimeout(() => {
      // Transform MOCK_CATEGORIES_DATA to include a simple item if LifeStories expects it
      // For now, this mock is designed to be close to MOCK_CATEGORIES
      // The `items` array is added here as an example of how it could be structured.
      // If LifeStories.tsx directly consumes categories where each category is a story, 
      // then the `items` field might not be needed or could be simplified.
      const responseData: StoriesResponse = { categories: MOCK_CATEGORIES_DATA };
      resolve(responseData);
    }, 500);
  });
};
