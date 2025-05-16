import { habitsStorage } from '@/core/database';
import { QueryClient } from '@tanstack/react-query';

/**
 * Network Interceptor Utility
 *
 * This module handles intercepting network requests, implementing
 * stale-while-revalidate strategy, and providing fallbacks for offline use.
 */

// Remove the circular dependency with queryClient
let queryClientRef: QueryClient | null = null;

/**
 * Set the query client reference after it's been initialized
 * This prevents circular dependency issues
 */
export function setQueryClientRef(client: QueryClient): void {
  queryClientRef = client;
}

/**
 * Wrapped fetch function with improved caching and offline support
 *
 * @param input - Request URL or Request object
 * @param init - Fetch options
 * @returns Promise with response
 */
export async function enhancedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Create a unique cache key based on the request
  const cacheKey = createCacheKey(input, init);
  const isApiRequest = isApiEndpoint(input.toString());

  try {
    // For API requests, implement stale-while-revalidate with React Query
    if (isApiRequest) {
      // Start with cached data
      const cached = await getCachedResponse(cacheKey);

      // Make the network request
      const networkPromise = window.origFetch ? window.origFetch(input, init) : fetch(input, init);

      const responsePromise = networkPromise
        .then(async response => {
          // Cache the response for future offline use
          if (response.ok) {
            await cacheResponse(cacheKey, response.clone());
          }
          return response;
        })
        .catch(err => {
          console.error('Network fetch failed:', err);
          if (cached) return cached;
          throw err;
        });

      // If we have cached data, return it immediately
      if (cached) {
        // Validate the network request in the background
        responsePromise.catch(err => {
          console.error('Background fetch failed:', err);
          // Invalidate related queries if needed
          if (queryClientRef && input.toString().includes('/api/habits')) {
            queryClientRef.invalidateQueries({ queryKey: ['habits'] });
          }
        });

        return cached;
      }

      // Otherwise wait for the network request
      return await responsePromise;
    }

    // For non-API requests, use network-first strategy
    return await (window.origFetch ? window.origFetch(input, init) : fetch(input, init));
  } catch (error) {
    console.error('Network request failed, falling back to cache:', error);

    // Try to get from cache
    const cached = await getCachedResponse(cacheKey);
    if (cached) return cached;

    // If no cache and offline, create a mock response for API endpoints
    if (isApiRequest) {
      return createOfflineResponse();
    }

    // Otherwise reject with the original error
    throw error;
  }
}

/**
 * Create a cache key for the request
 */
function createCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
  const url = input.toString();

  // For simple GET requests, the URL is enough
  if (!init || !init.method || init.method === 'GET') {
    return url;
  }

  // For POST/PUT/DELETE with body, hash the body too
  let body = '';
  if (init.body) {
    if (typeof init.body === 'string') {
      body = init.body;
    } else if (init.body instanceof FormData) {
      body = 'formdata:' + new Date().getTime(); // FormData can't be easily serialized
    } else {
      try {
        body = JSON.stringify(init.body);
      } catch {
        body = 'body:' + new Date().getTime();
      }
    }
  }

  return `${init.method}:${url}:${body}`;
}

/**
 * Check if URL is an API endpoint that should be specially handled
 */
function isApiEndpoint(url: string): boolean {
  const apiEndpoints = ['/api/habits', '/api/life-wheel', '/api/vision-board'];
  return apiEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Retrieve cached response by key
 */
async function getCachedResponse(key: string): Promise<Response | null> {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return null;
    }

    try {
      const cache = await caches.open('api-cache-v1');
      const response = await cache.match(key);

      if (response && response.ok) {
        // Check if response is stale (older than 1 hour)
        const timestamp = response.headers.get('sw-cache-timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          // If younger than 1 hour, return it
          if (age < 60 * 60 * 1000) {
            return response;
          }
        }

        // If no timestamp or stale, still return for offline case
        return response;
      }
    } catch (e) {
      console.warn('Cache API error:', e);
    }

    // If no cache API or no match, try IndexedDB
    if (key.includes('/api/habits')) {
      try {
        // Get from IndexedDB if it's a habits API call
        const habitData = await habitsStorage.getCachedHabitStats('current_user');
        if (habitData) {
          return new Response(JSON.stringify(habitData), {
            headers: {
              'Content-Type': 'application/json',
              'X-Is-Offline': 'true',
            },
          });
        }
      } catch (e) {
        console.warn('IndexedDB retrieval error:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

/**
 * Cache a response
 */
async function cacheResponse(key: string, response: Response): Promise<void> {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open('api-cache-v1');

      // Add timestamp header to track freshness
      const headers = new Headers(response.headers);
      headers.append('sw-cache-timestamp', Date.now().toString());

      // Create new response with added headers
      const responseToCache = new Response(await response.clone().blob(), {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });

      // Store in cache
      await cache.put(key, responseToCache);
    } catch (e) {
      console.warn('Cache API error while storing response:', e);
    }

    // Also cache in IndexedDB if it's a relevant API
    if (key.includes('/api/habits') && response.ok) {
      try {
        const cloned = response.clone();
        const text = await cloned.text();
        if (!text) return;

        try {
          const data = JSON.parse(text);
          console.info('Received habits API response:', {
            url: key,
            hasHabits: !!(data && data.habits),
            habitsLength: data?.habits?.length || 0,
            hasStats: !!(data && data.stats),
          });

          // Example: cache habits data in IndexedDB
          if (data && data.habits && Array.isArray(data.habits)) {
            await habitsStorage.saveHabits(data.habits);
          }
          if (data && data.stats) {
            await habitsStorage.cacheHabitStats('current_user', data.stats);
          }
        } catch (parseError) {
          console.error(
            'Failed to parse habits API response:',
            parseError,
            'Response text:',
            text.substring(0, 200)
          );
        }
      } catch (e) {
        console.warn('Error caching in IndexedDB:', e);
      }
    }
  } catch (error) {
    console.warn('Error in cacheResponse:', error);
  }
}

/**
 * Create an offline response for API requests
 */
function createOfflineResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Network is currently unavailable',
      offline: true,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Is-Offline': 'true',
      },
    }
  );
}

// Add property to Window interface
declare global {
  interface Window {
    origFetch?: typeof fetch;
  }
}

/**
 * Replace the global fetch with our enhanced version
 * Call this early in your application to intercept all fetch calls
 */
export function initNetworkInterceptor(): void {
  if (typeof window !== 'undefined' && !window.origFetch) {
    // Store the original fetch
    window.origFetch = window.fetch;

    // Replace with our version
    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      try {
        return await enhancedFetch(input, init);
      } catch (err) {
        // Fall back to original fetch if our enhanced version fails
        if (window.origFetch) {
          return window.origFetch(input, init);
        }
        throw err;
      }
    };

    console.info('Network interceptor initialized');
  }
}

/**
 * Safely create a fetch middleware for React Query
 */
export const fetchWithOfflineSupport = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    return await enhancedFetch(url, options);
  } catch (error) {
    console.error('Fetch with offline support failed:', error);
    // Fall back to original fetch
    if (window.origFetch) {
      return window.origFetch(url, options);
    }
    throw error;
  }
};
