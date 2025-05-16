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

// API endpoints to cache
const API_CACHE_NAME = `api-cache-${CACHE_VERSION}`;
const API_ENDPOINTS = ['/api/habits'];

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

// Fetch event - handle network requests with stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (
    !event.request.url.startsWith(self.location.origin) &&
    !event.request.url.includes('localhost:3000')
  ) {
    return;
  }

  // For API requests, use a network-first strategy
  if (API_ENDPOINTS.some(endpoint => event.request.url.includes(endpoint))) {
    return event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response if it's valid
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
  }

  // For other requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return the response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      // Make network request
      return fetch(fetchRequest)
        .then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Open cache and store response
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(error => {
          console.info('[Service Worker] Fetch failed:', error);
          // For navigation requests, fallback to offline page if available
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
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
