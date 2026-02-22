self.addEventListener('push', event => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = {
      title: 'WeBetter',
      body: 'You have a new notification.',
    };
  }

  const title = typeof payload.title === 'string' ? payload.title : 'WeBetter';
  const body = typeof payload.body === 'string' ? payload.body : 'You have a new notification.';
  const ctaUrl = typeof payload.ctaUrl === 'string' ? payload.ctaUrl : '/app/notifications';
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      ctaUrl,
      metadata,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const ctaUrl = event.notification?.data?.ctaUrl || '/app/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(ctaUrl);
          return client.focus();
        }
      }
      return clients.openWindow(ctaUrl);
    })
  );
});
