/**
 * Service Worker Registration
 *
 * This module handles the registration of the service worker
 * to enable offline functionality, caching, and push notifications.
 */

type RegistrationOptions = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  scope?: string;
};

/**
 * Checks if service workers are supported by the browser
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'caches' in window && 'PushManager' in window;
};

/**
 * Register the service worker
 */
export const register = (options: RegistrationOptions = {}): void => {
  // Only register in production or when explicitly enabled in development
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );

  // Check if service workers are supported
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers are not supported by this browser');
    return;
  }

  // Default options
  const defaultOptions: RegistrationOptions = {
    scope: '/',
    onSuccess: registration => {
      console.info('ServiceWorker registration successful with scope:', registration.scope);
    },
    onUpdate: registration => {
      console.info('New service worker is available');

      // Show notification to user
      if (window.confirm('New version of the application is available. Update now?')) {
        // Skip waiting and refresh to update
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    },
    onError: error => {
      console.error('Error during service worker registration:', error);
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    if (isLocalhost) {
      // Check if a service worker still exists or not
      checkValidServiceWorker(swUrl, mergedOptions);
    } else {
      // If not localhost, register service worker directly
      registerValidSW(swUrl, mergedOptions);
    }
  });

  // Listen for service worker updates
  window.addEventListener('controllerchange', () => {
    console.info('Controller changed - reloading page');
  });
};

/**
 * Register a valid service worker
 */
function registerValidSW(swUrl: string, options: RegistrationOptions): void {
  navigator.serviceWorker
    .register(swUrl, { scope: options.scope })
    .then(registration => {
      // Check for updates on each page load
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.info(
                'New content is available and will be used when all tabs for this page are closed.'
              );

              // Execute callback
              if (options.onUpdate) {
                options.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.info('Content is cached for offline use.');

              // Execute callback
              if (options.onSuccess) {
                options.onSuccess(registration);
              }
            }
          }
        });
      });
    })
    .catch(error => {
      if (options.onError) {
        options.onError(error);
      }
    });
}

/**
 * Check if a service worker is valid
 */
function checkValidServiceWorker(swUrl: string, options: RegistrationOptions): void {
  // Check if the service worker can be found
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType !== null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, options);
      }
    })
    .catch(() => {
      console.info('No internet connection found. App is running in offline mode.');
    });
}

/**
 * Unregister the service worker
 */
export const unregister = async (): Promise<void> => {
  if (isServiceWorkerSupported()) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  }
};

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported() || !('Notification' in window)) {
    console.warn('Push notifications are not supported by this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if we can request notification permission
 */
export const canRequestNotificationPermission = (): boolean => {
  return (
    isServiceWorkerSupported() && 'Notification' in window && Notification.permission !== 'denied'
  );
};

// Fix line 207: Add type assertion for ServiceWorkerRegistration with sync property
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
}

/**
 * Register for background sync
 */
export const registerBackgroundSync = async (tag: string): Promise<boolean> => {
  if (!isServiceWorkerSupported() || !('SyncManager' in window)) {
    console.warn('Background sync is not supported by this browser');
    return false;
  }

  try {
    const registration = (await navigator.serviceWorker.ready) as ExtendedServiceWorkerRegistration;
    if (registration.sync) {
      await registration.sync.register(tag);
      return true;
    }
    console.warn('SyncManager is not available in the current service worker');
    return false;
  } catch (error) {
    console.error('Error registering background sync:', error);
    return false;
  }
};
