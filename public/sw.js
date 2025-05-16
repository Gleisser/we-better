// Service Worker version - increment this when you update the service worker
const CACHE_VERSION = 'v1';
const CACHE_NAME = `we-better-${CACHE_VERSION}`;
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;

// Assets to cache (app shell)
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/site.webmanifest',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/assets/images/hero/app_hero_img.webp',
  '/assets/images/hero/mobile/app_hero_img-mobile.webp',
];

// API endpoints to cache with different strategies
const API_CACHE_NAME = `api-cache-${CACHE_VERSION}`;
const API_ENDPOINTS = [
  { url: '/api/habits', strategy: 'stale-while-revalidate' },
  { url: '/api/life-wheel', strategy: 'stale-while-revalidate' },
  { url: '/api/vision-board', strategy: 'stale-while-revalidate' },
];

// Maximum age for cached API responses
const API_CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hour

// Install event - cache app shell
self.addEventListener('install', event => {
  console.info('[Service Worker] Installing Service Worker...', event);

  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then(cache => {
        console.info('[Service Worker] Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        console.info('[Service Worker] App Shell Cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.info('[Service Worker] Activating Service Worker...', event);

  event.waitUntil(
    caches
      .keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            // If the key doesn't include the current version, delete it
            if (key !== APP_SHELL_CACHE && key !== API_CACHE_NAME && key !== CACHE_NAME) {
              console.info('[Service Worker] Removing old cache', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.info('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

/**
 * Determine if a request is an API request that should be intercepted
 * @param {string} url - The URL to check
 * @returns {Object|null} The matching API endpoint config or null
 */
function matchApiEndpoint(url) {
  return API_ENDPOINTS.find(endpoint => url.includes(endpoint.url)) || null;
}

/**
 * Check if a cached response is still fresh
 * @param {Response} cachedResponse - The cached response to check
 * @returns {boolean} Whether the response is still considered fresh
 */
function isCachedResponseFresh(cachedResponse) {
  if (!cachedResponse) return false;

  // Get the timestamp from the response headers
  const cachedTime = cachedResponse.headers.get('sw-cache-timestamp');
  if (!cachedTime) return false;

  const ageInMs = Date.now() - parseInt(cachedTime, 10);
  return ageInMs < API_CACHE_MAX_AGE;
}

/**
 * Cache a response with timestamp
 * @param {Request} request - The original request
 * @param {Response} response - The response to cache
 * @returns {Promise<Response>} The original response
 */
async function cacheResponseWithTimestamp(request, response) {
  if (!response || !response.ok) return response;

  const cache = await caches.open(API_CACHE_NAME);
  const clonedResponse = response.clone();

  // Create headers with timestamp
  const headers = new Headers(clonedResponse.headers);
  headers.append('sw-cache-timestamp', Date.now().toString());

  // Create new response with timestamp header
  const timestampedResponse = new Response(await clonedResponse.blob(), {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers,
  });

  cache.put(request, timestampedResponse);
  return response;
}

/**
 * Implement stale-while-revalidate strategy
 * - Return cached response immediately if available
 * - Fetch fresh response in the background and update cache
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} The response
 */
async function staleWhileRevalidate(event) {
  const cachedResponse = await caches.match(event.request);
  const fetchPromise = fetch(event.request)
    .then(response => cacheResponseWithTimestamp(event.request, response))
    .catch(error => {
      console.error('[Service Worker] Network fetch failed:', error);
      // If we have a cached response, return it even if it's stale
      return cachedResponse;
    });

  // Return the cached response immediately if available,
  // otherwise wait for the network response
  return cachedResponse || fetchPromise;
}

/**
 * Implement network-first strategy
 * - Try network first
 * - Fall back to cache if network fails
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} The response
 */
async function networkFirst(event) {
  try {
    const response = await fetch(event.request);
    await cacheResponseWithTimestamp(event.request, response);
    return response;
  } catch (error) {
    console.info('[Service Worker] Network request failed, falling back to cache:', error);
    const cachedResponse = await caches.match(event.request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If there's nothing in the cache, return an offline response
    if (event.request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    return new Response(JSON.stringify({ error: 'Network is unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Implement cache-first strategy
 * - Return cached response if available
 * - Otherwise fetch from network and cache
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} The response
 */
async function cacheFirst(event) {
  const cachedResponse = await caches.match(event.request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(event.request);

    // Check if we got a valid response
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }

    const responseToCache = networkResponse.clone();
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, responseToCache);

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // For navigation requests, fallback to offline page
    if (event.request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    // Return empty response with error status
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Fetch event - handle network requests with appropriate strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests that aren't API calls to our backend
  if (
    !event.request.url.startsWith(self.location.origin) &&
    !event.request.url.includes('localhost:3000')
  ) {
    return;
  }

  // Detect API requests
  const apiEndpoint = matchApiEndpoint(event.request.url);

  // Handle based on strategy
  if (apiEndpoint) {
    switch (apiEndpoint.strategy) {
      case 'stale-while-revalidate':
        event.respondWith(staleWhileRevalidate(event));
        break;
      case 'network-first':
        event.respondWith(networkFirst(event));
        break;
      case 'cache-first':
        event.respondWith(cacheFirst(event));
        break;
      default:
        // Default to network-first for API requests
        event.respondWith(networkFirst(event));
    }
    return;
  }

  // For navigation requests (HTML pages), use network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event));
    return;
  }

  // For all other assets (JS, CSS, images), use cache-first
  event.respondWith(cacheFirst(event));
});

// Handle sync events for background syncing
self.addEventListener('sync', event => {
  console.info('[Service Worker] Background Syncing', event);

  // Handle the habits-sync tag (for syncing habits data)
  if (event.tag === 'habits-sync') {
    event.waitUntil(syncHabitsData());
  }
});

// Function to sync habits data when back online
function syncHabitsData() {
  // This would be implemented to communicate with IndexedDB
  // and sync any pending changes with the server
  console.info('[Service Worker] Syncing habits data');

  // Return promise that would handle the sync logic
  return Promise.resolve();

  // In a real implementation, this would:
  // 1. Get unsynced data from IndexedDB
  // 2. Send API requests to sync each item
  // 3. Mark items as synced in IndexedDB
}

// Listen for push events (notifications)
self.addEventListener('push', event => {
  console.info('[Service Worker] Push Received', event);

  let data = {
    title: 'New Notification',
    body: 'Something happened',
    icon: '/android-chrome-192x192.png',
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/android-chrome-192x192.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.info('[Service Worker] Notification click', event);

  event.notification.close();

  if (event.action === 'explore') {
    // Open the app when the notification is clicked
    event.waitUntil(clients.openWindow('/'));
  }
});
