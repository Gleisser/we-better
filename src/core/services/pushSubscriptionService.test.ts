import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSessionMock = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
    },
  },
}));

describe('pushSubscriptionService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    getSessionMock.mockReset();
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: 'token',
        },
      },
    });

    Object.defineProperty(window, 'PushManager', {
      configurable: true,
      value: function PushManager() {},
    });

    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
    });

    const registerMock = vi.fn();
    const getRegistrationMock = vi.fn().mockResolvedValue(null);

    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerMock,
        getRegistration: getRegistrationMock,
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ) as typeof fetch;
  });

  it('registers the notifications service worker only after first paint when permission is granted', async () => {
    const registerMock = vi.mocked(window.navigator.serviceWorker.register);
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: {
        permission: 'granted',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
    });

    const { registerServiceWorkerAfterFirstPaint } = await import('./pushSubscriptionService');

    registerServiceWorkerAfterFirstPaint();

    expect(registerMock).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(registerMock).toHaveBeenCalledWith('/sw-notifications.js');
  });

  it('subscribes by ensuring the service worker registration on demand', async () => {
    const subscribeMock = vi.fn().mockResolvedValue({
      toJSON: () => ({
        endpoint: 'https://push.example.com/subscription',
        keys: {
          p256dh: 'key',
          auth: 'auth',
        },
      }),
    });

    const getSubscriptionMock = vi.fn().mockResolvedValue(null);
    const registerMock = vi.mocked(window.navigator.serviceWorker.register);
    registerMock.mockResolvedValue({
      pushManager: {
        getSubscription: getSubscriptionMock,
        subscribe: subscribeMock,
      },
    } as unknown as ServiceWorkerRegistration);

    const { pushSubscriptionService } = await import('./pushSubscriptionService');
    const result = await pushSubscriptionService.subscribeCurrentBrowser();

    expect(registerMock).toHaveBeenCalledWith('/sw-notifications.js');
    expect(subscribeMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, error: null });
  });
});
