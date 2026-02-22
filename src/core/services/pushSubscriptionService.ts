import { supabase } from './supabaseClient';

const API_BASE_URL = `${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000'}/api/notifications/push-subscriptions`;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_PUSH_VAPID_PUBLIC_KEY as string | undefined;

function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token for push subscriptions API:', error);
    return null;
  }
};

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  );
}

async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/sw-notifications.js');
  if (existing) {
    return existing;
  }
  return navigator.serviceWorker.register('/sw-notifications.js');
}

async function persistSubscription(
  subscription: PushSubscription
): Promise<{ success: boolean; error: string | null }> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  const serialized = subscription.toJSON();
  const endpoint = serialized.endpoint;
  const p256dh = serialized.keys?.p256dh;
  const auth = serialized.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return { success: false, error: 'Invalid push subscription payload' };
  }

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    return { success: false, error: message };
  }

  return { success: true, error: null };
}

class PushSubscriptionService {
  private static instance: PushSubscriptionService;

  private constructor() {}

  public static getInstance(): PushSubscriptionService {
    if (!PushSubscriptionService.instance) {
      PushSubscriptionService.instance = new PushSubscriptionService();
    }
    return PushSubscriptionService.instance;
  }

  isSupported(): boolean {
    return isPushSupported();
  }

  async subscribeCurrentBrowser(): Promise<{ success: boolean; error: string | null }> {
    if (!isPushSupported()) {
      return { success: false, error: 'Push notifications are not supported in this browser' };
    }

    if (!VAPID_PUBLIC_KEY) {
      return { success: false, error: 'Missing VITE_PUSH_VAPID_PUBLIC_KEY' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Push notification permission was not granted' };
    }

    try {
      const registration = await getOrRegisterServiceWorker();
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        return persistSubscription(existingSubscription);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY),
      });

      return persistSubscription(subscription);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to push notifications',
      };
    }
  }

  async unsubscribeCurrentBrowser(): Promise<{ success: boolean; error: string | null }> {
    if (!isPushSupported()) {
      return { success: true, error: null };
    }

    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-notifications.js');
      const subscription = registration
        ? await registration.pushManager.getSubscription()
        : await (await getOrRegisterServiceWorker()).pushManager.getSubscription();

      if (!subscription) {
        return { success: true, error: null };
      }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      const response = await fetch(API_BASE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const message =
          typeof payload.error === 'string'
            ? payload.error
            : `Request failed with status ${response.status}`;
        return { success: false, error: message };
      }

      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to unsubscribe from push notifications',
      };
    }
  }
}

export const pushSubscriptionService = PushSubscriptionService.getInstance();
export default pushSubscriptionService;
