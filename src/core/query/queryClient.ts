import { QueryClient } from '@tanstack/react-query';
import { fetchWithOfflineSupport, setQueryClientRef } from '../utils/networkInterceptor';

/**
 * Default configuration values for React Query
 */
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff capped at 30s
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000), // exponential backoff capped at 15s
    },
  },
};

/**
 * Custom fetch function for React Query that provides offline support
 */
export const offlineFetch = async <T>({
  url,
  method = 'GET',
  headers = {},
  body,
}: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetchWithOfflineSupport(url, options);

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    // Handle offline response (created by our interceptor)
    const isOffline = response.headers.get('X-Is-Offline') === 'true';
    if (isOffline) {
      console.info('Using offline data for:', url);
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      try {
        // Try to parse as JSON anyway
        return JSON.parse(text) as T;
      } catch {
        // Return text as is
        return text as unknown as T;
      }
    }
  } catch (error) {
    console.error('Query fetch error:', error);
    throw error;
  }
};

/**
 * Create a configured QueryClient instance
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient(queryConfig);
};

/**
 * Default QueryClient instance for application-wide use
 */
export const queryClient = createQueryClient();

// Set the query client reference in the networkInterceptor to avoid circular dependencies
setQueryClientRef(queryClient);
