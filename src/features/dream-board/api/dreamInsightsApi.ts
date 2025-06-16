import { supabase } from '@/core/services/supabaseClient';

// Define the API URL
const API_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/insights`;

// Types for Dream Insights (matching the backend interfaces)
export interface DreamInsight {
  id: string;
  type: 'pattern' | 'balance' | 'progress' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  relatedCategories?: string[];
  dataSource: string[];
  metadata: {
    generatedAt: string;
    expiresAt: string;
    sampleSize: number;
    timeRange: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InsightGenerationParams {
  types?: ('pattern' | 'balance' | 'progress' | 'suggestion')[];
  categories?: string[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  minConfidence?: number;
  maxResults?: number;
  forceRefresh?: boolean;
  includeExpired?: boolean;
}

export interface InsightResponse {
  success: boolean;
  data: {
    insights: DreamInsight[];
    metadata: {
      totalGenerated: number;
      generationTime: number;
      cacheHit: boolean;
      dataQuality: {
        isValid: boolean;
        score: number;
        sampleSize: number;
      };
      user_id?: string;
      requestParams?: Partial<InsightGenerationParams>;
    };
  };
  message?: string;
}

export interface InsightStats {
  user_id: string;
  insights: {
    total: number;
    byType: {
      pattern: number;
      balance: number;
      progress: number;
      suggestion: number;
    };
    averageConfidence: number;
    lastGenerated: string | null;
  };
  dataAvailability: {
    dreamBoards: number;
    progressEntries: number;
    goals: number;
    habits: number;
    categories: number;
  };
  dataHealth: {
    overallHealth: number;
    dreamBoardHealth: number;
    progressHealth: number;
    goalHealth: number;
    habitHealth: number;
  };
  readiness: {
    ready: boolean;
    score: number;
    level: 'poor' | 'fair' | 'good' | 'excellent';
    blockers: string[];
    nextSteps: string[];
  };
  recommendations: Array<{
    type: 'data' | 'engagement' | 'diversification';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action: string;
  }>;
  system: {
    generatedAt: string;
    version: string;
  };
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
  body?: Record<string, unknown> | InsightGenerationParams
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
        throw new Error('Authentication expired');
      }
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Insufficient data for insights');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before requesting new insights.');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Get user insights with optional filtering
 */
export const getDreamInsights = async (
  params: InsightGenerationParams = {}
): Promise<DreamInsight[]> => {
  try {
    const searchParams = new URLSearchParams();

    if (params.types?.length) {
      searchParams.append('types', params.types.join(','));
    }
    if (params.categories?.length) {
      searchParams.append('categories', params.categories.join(','));
    }
    if (params.timeRange) {
      searchParams.append('timeRange', params.timeRange);
    }
    if (params.minConfidence !== undefined) {
      searchParams.append('minConfidence', params.minConfidence.toString());
    }
    if (params.maxResults !== undefined) {
      searchParams.append('maxResults', params.maxResults.toString());
    }
    if (params.forceRefresh) {
      searchParams.append('forceRefresh', 'true');
    }
    if (params.includeExpired) {
      searchParams.append('includeExpired', 'true');
    }

    const url = searchParams.toString() ? `${API_URL}?${searchParams}` : API_URL;
    const result = await apiRequest<InsightResponse>(url);
    return result?.data.insights || [];
  } catch (error) {
    console.error('Error getting dream insights:', error);

    // Return empty array for certain error types to allow graceful degradation
    if (error instanceof Error && error.message.includes('Insufficient data')) {
      console.info('Insufficient data for insights - returning empty array');
      return [];
    }

    throw error;
  }
};

/**
 * Generate fresh insights (bypasses cache)
 */
export const generateFreshInsights = async (
  params: InsightGenerationParams = {}
): Promise<DreamInsight[]> => {
  try {
    const result = await apiRequest<InsightResponse>(`${API_URL}/generate`, 'POST', params);
    return result?.data.insights || [];
  } catch (error) {
    console.error('Error generating fresh insights:', error);
    throw error;
  }
};

/**
 * Get insight statistics and analytics
 */
export const getInsightStats = async (): Promise<InsightStats | null> => {
  try {
    const result = await apiRequest<{ success: boolean; data: InsightStats }>(`${API_URL}/stats`);
    return result?.data || null;
  } catch (error) {
    console.error('Error getting insight stats:', error);
    return null;
  }
};

/**
 * Test insights system health
 */
export const testInsightsSystem = async (): Promise<boolean> => {
  try {
    const result = await apiRequest<{ success: boolean }>(`${API_URL}/test`);
    return result?.success || false;
  } catch (error) {
    console.error('Error testing insights system:', error);
    return false;
  }
};

/**
 * Helper function to format insights for the DreamInsights component
 * Converts backend format to the format expected by the component
 */
export const formatInsightsForComponent = (
  insights: DreamInsight[]
): Array<{
  id: string;
  type: 'pattern' | 'balance' | 'progress' | 'suggestion';
  title: string;
  description: string;
  relatedCategories?: string[];
}> => {
  return insights.map(insight => ({
    id: insight.id,
    type: insight.type,
    title: insight.title,
    description: insight.description,
    relatedCategories: insight.relatedCategories,
  }));
};

/**
 * Helper function to get insights ready for the DreamInsights component
 * Includes error handling and fallback logic
 */
export const getInsightsForComponent = async (
  params: InsightGenerationParams = {}
): Promise<
  Array<{
    id: string;
    type: 'pattern' | 'balance' | 'progress' | 'suggestion';
    title: string;
    description: string;
    relatedCategories?: string[];
  }>
> => {
  try {
    const insights = await getDreamInsights(params);
    return formatInsightsForComponent(insights);
  } catch (error) {
    console.error('Error getting insights for component:', error);

    // Return fallback insights for new users or when there's insufficient data
    return [
      {
        id: 'welcome-1',
        type: 'suggestion',
        title: 'Welcome to Dream Insights!',
        description:
          'Start adding dreams, goals, and tracking your progress to get personalized insights about your journey.',
        relatedCategories: [],
      },
      {
        id: 'welcome-2',
        type: 'pattern',
        title: 'Build Your Dream Foundation',
        description:
          'Create at least 3 dream board entries in different categories to unlock pattern analysis.',
        relatedCategories: [],
      },
    ];
  }
};
